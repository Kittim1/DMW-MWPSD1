<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use App\Models\Ticket;
use App\Models\SystemLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class QueueController extends Controller
{
    private function getCurrentSessionType()
    {
        $hour = now()->hour;
        return $hour < 12 ? 'morning' : 'afternoon';
    }

    private function getCurrentSessionDate()
    {
        return now()->format('Y-m-d');
    }

    private function initializeSessionTickets()
    {
        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();
        
        // Use cache to prevent repeated database checks
        $cacheKey = "tickets_initialized_{$sessionDate}_{$sessionType}";
        
        if (Cache::has($cacheKey)) {
            return; // Already initialized in this session
        }

        // Check if tickets already exist for this session
        $existingTickets = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->count();

        if ($existingTickets > 0) {
            // Set cache for 24 hours so we don't check again
            Cache::put($cacheKey, true, 86400);
            return;
        }

        // Bulk insert tickets 01-50 for both morning and afternoon sessions (MUCH FASTER)
        $ticketsToInsert = [];
        for ($i = 1; $i <= 50; $i++) {
            $ticketsToInsert[] = [
                'priority_number' => str_pad($i, 2, '0', STR_PAD_LEFT),
                'session_date' => $sessionDate,
                'session_type' => $sessionType,
                'status' => Ticket::STATUS_WAITING,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        
        // Insert all 50 at once (1 query instead of 50)
        Ticket::insert($ticketsToInsert);
        
        // Set cache so we don't check again
        Cache::put($cacheKey, true, 86400);
    }

    public function getWaiting()
    {
        $this->initializeSessionTickets();

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $tickets = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('priority_number', 'asc')
            ->get(['id as ticket_id', 'priority_number', 'counter_id', 'status']);

        return response()->json($tickets);
    }

    public function getServing()
    {
        $this->initializeSessionTickets();

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $tickets = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_SERVING)
            ->orderBy('called_at', 'asc')
            ->get(['id as ticket_id', 'priority_number', 'counter_id', 'status']);

        return response()->json($tickets);
    }

    public function getStatus()
    {
        $this->initializeSessionTickets();

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $serving = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_SERVING)
            ->orderBy('called_at', 'asc')
            ->get(['id as ticket_id', 'priority_number', 'counter_id', 'status']);

        $waiting = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('priority_number', 'asc')
            ->get(['id as ticket_id', 'priority_number', 'counter_id', 'status']);

        $skipped = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_SKIPPED)
            ->orderBy('updated_at', 'desc')
            ->get(['id as ticket_id', 'priority_number', 'counter_id', 'status']);

        // New: Get counts for individual counters and session totals
        $dailyTickets = Ticket::where('session_date', $sessionDate)->get();
        
        $counterCounts = [];
        for ($i = 1; $i <= 5; $i++) {
            $counterCounts[$i] = $dailyTickets
                ->where('counter_id', $i)
                ->where('status', Ticket::STATUS_COMPLETED)
                ->count();
        }

        $sessionTotals = [
            'morning' => $dailyTickets->where('session_type', 'morning')->where('status', Ticket::STATUS_COMPLETED)->count(),
            'afternoon' => $dailyTickets->where('session_type', 'afternoon')->where('status', Ticket::STATUS_COMPLETED)->count(),
        ];

        return response()->json([
            'serving' => $serving,
            'waiting' => $waiting,
            'skipped' => $skipped,
            'stats' => [
                'counterCounts' => $counterCounts,
                'sessionTotals' => $sessionTotals
            ]
        ]);
    }

    public function callNext($counterId)
    {
        $this->initializeSessionTickets();

        $counter = Counter::findOrFail($counterId);

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        // New: Check if the counter's current ticket is from a previous session
        if ($counter->current_ticket_id) {
            $currentTicket = Ticket::find($counter->current_ticket_id);
            if (!$currentTicket || 
                $currentTicket->session_date !== $sessionDate || 
                $currentTicket->session_type !== $sessionType ||
                $currentTicket->status !== Ticket::STATUS_SERVING) {
                
                // The ticket is stale or finished, free the counter automatically
                $counter->update(['current_ticket_id' => null]);
                $counter->refresh();
            }
        }

        // Check if counter is already serving something (now with stale check above)
        if ($counter->current_ticket_id) {
            return response()->json(['message' => 'Counter is already serving a ticket'], 400);
        }

        $nextTicket = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('priority_number', 'asc')
            ->first();

        if (!$nextTicket) {
            return response()->json(['message' => 'No more tickets in queue'], 404);
        }

        $nextTicket->update([
            'status' => Ticket::STATUS_SERVING,
            'counter_id' => $counterId,
            'called_at' => now(),
        ]);

        $counter->update(['current_ticket_id' => $nextTicket->id]);

        // Log the action
        SystemLog::create([
            'user_id' => auth()->id(),
            'action' => 'catered',
            'details' => "Counter {$counterId} catered priority number {$nextTicket->priority_number}"
        ]);

        return response()->json($nextTicket);
    }

    public function completeService($ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);

        $ticket->update([
            'status' => Ticket::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        if ($ticket->counter_id) {
            Counter::find($ticket->counter_id)->update(['current_ticket_id' => null]);
            
            // Log the action
            SystemLog::create([
                'user_id' => auth()->id(),
                'action' => 'completed',
                'details' => "Counter {$ticket->counter_id} completed the transaction for priority number {$ticket->priority_number}"
            ]);
        }

        return response()->json(['message' => 'Service completed', 'ticket' => $ticket]);
    }

    public function skipTicket($ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);

        $ticket->update([
            'status' => Ticket::STATUS_SKIPPED,
            'counter_id' => null, // Remove from counter when skipped
        ]);

        // Also update counter to not have a current ticket
        Counter::where('current_ticket_id', $ticketId)->update(['current_ticket_id' => null]);

        // Log the action
        SystemLog::create([
            'user_id' => auth()->id(),
            'action' => 'skipped',
            'details' => "Counter " . (auth()->user()->counter?->id ?? 'N/A') . " skipped priority number {$ticket->priority_number}"
        ]);

        return response()->json(['message' => 'Ticket skipped', 'ticket' => $ticket]);
    }

    public function cancelTicket($ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);

        $ticket->update([
            'status' => Ticket::STATUS_CANCELLED,
            'counter_id' => null,
        ]);

        // Ensure counter is freed if it was somehow still linked
        Counter::where('current_ticket_id', $ticketId)->update(['current_ticket_id' => null]);

        // Log the action
        SystemLog::create([
            'user_id' => auth()->id(),
            'action' => 'cancelled',
            'details' => "Counter " . (auth()->user()->counter?->id ?? 'N/A') . " cancelled priority number {$ticket->priority_number}"
        ]);

        return response()->json(['message' => 'Ticket cancelled', 'ticket' => $ticket]);
    }

    public function caterTicket($ticketId, $counterId)
    {
        $ticket = Ticket::findOrFail($ticketId);
        $counter = Counter::findOrFail($counterId);

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        // New: Check if the counter's current ticket is from a previous session
        if ($counter->current_ticket_id) {
            $currentServing = Ticket::find($counter->current_ticket_id);
            if (!$currentServing || 
                $currentServing->session_date !== $sessionDate || 
                $currentServing->session_type !== $sessionType ||
                $currentServing->status !== Ticket::STATUS_SERVING) {
                
                $counter->update(['current_ticket_id' => null]);
                $counter->refresh();
            }
        }

        // Check if counter is already serving something
        if ($counter->current_ticket_id) {
            return response()->json(['message' => 'Counter is already serving a ticket'], 400);
        }

        $ticket->update([
            'status' => Ticket::STATUS_SERVING,
            'counter_id' => $counterId,
            'called_at' => now(),
        ]);

        $counter->update(['current_ticket_id' => $ticket->id]);

        // Log the action
        SystemLog::create([
            'user_id' => auth()->id(),
            'action' => 'catered_again',
            'details' => "Counter {$counterId} catered skipped priority number {$ticket->priority_number} again"
        ]);

        return response()->json(['message' => 'Ticket called again', 'ticket' => $ticket]);
    }

    public function getTickets()
    {
        $tickets = Ticket::orderBy('created_at', 'desc')->paginate(20);
        return response()->json($tickets);
    }

    public function addTicket(Request $request)
    {
        $validated = $request->validate([
            'priority_number' => 'required|string|unique:tickets',
        ]);

        $ticket = Ticket::create([
            'priority_number' => $validated['priority_number'],
            'session_date' => $this->getCurrentSessionDate(),
            'session_type' => $this->getCurrentSessionType(),
            'status' => Ticket::STATUS_WAITING,
        ]);

        return response()->json($ticket, 201);
    }

    public function resetQueue()
    {
        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        // Delete all tickets for the current session
        Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->delete();

        // Clear cache key to force re-initialization
        $cacheKey = "tickets_initialized_{$sessionDate}_{$sessionType}";
        Cache::forget($cacheKey);

        // Reset all counters' current_ticket_id
        Counter::query()->update(['current_ticket_id' => null]);

        // Log the action
        SystemLog::create([
            'user_id' => auth()->id(),
            'action' => 'reset_queue',
            'details' => "Super Admin reset the entire queue for " . $sessionDate . " (" . $sessionType . ")"
        ]);

        return response()->json(['message' => 'Queue reset successfully']);
    }

    public function getReports(Request $request)
    {
        $type = $request->query('type', 'daily');
        $now = now();

        $query = Ticket::query();

        if ($type === 'daily') {
            $query->whereDate('session_date', $now->toDateString());
        } elseif ($type === 'monthly') {
            $query->whereMonth('session_date', $now->month)
                  ->whereYear('session_date', $now->year);
        } elseif ($type === 'yearly') {
            $query->whereYear('session_date', $now->year);
        }

        $tickets = $query->get();

        // Calculate actual average wait time (from creation/session start to being called)
        $calledTickets = $tickets->whereNotNull('called_at');
        $avgWaitTime = '0m';
        
        if ($calledTickets->count() > 0) {
            $totalWaitMinutes = $calledTickets->reduce(function ($carry, $ticket) {
                return $carry + $ticket->called_at->diffInMinutes($ticket->created_at);
            }, 0);
            
            $avgMinutes = round($totalWaitMinutes / $calledTickets->count());
            $avgWaitTime = $avgMinutes . 'm';
        }

        return response()->json([
            'totalTickets' => $tickets->count(),
            'served' => $tickets->where('status', Ticket::STATUS_COMPLETED)->count(),
            'skipped' => $tickets->where('status', Ticket::STATUS_SKIPPED)->count(),
            'cancelled' => $tickets->where('status', Ticket::STATUS_CANCELLED)->count(),
            'avgWaitTime' => $avgWaitTime,
        ]);
    }

    public function getSystemLogs()
    {
        $logs = SystemLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($logs);
    }
}

