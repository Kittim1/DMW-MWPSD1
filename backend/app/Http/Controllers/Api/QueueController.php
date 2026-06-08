<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Counter;
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

        return response()->json([
            'serving' => $serving,
            'waiting' => $waiting,
            'skipped' => $skipped
        ]);
    }

    public function callNext($counterId)
    {
        $this->initializeSessionTickets();

        $counter = Counter::findOrFail($counterId);

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $nextTicket = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('priority_number', 'asc')
            ->first();

        if (!$nextTicket) {
            return response()->json(['message' => 'No tickets in queue'], 400);
        }

        $nextTicket->update([
            'status' => Ticket::STATUS_SERVING,
            'counter_id' => $counterId,
            'called_at' => now(),
        ]);

        $counter->update(['current_ticket_id' => $nextTicket->id]);

        return response()->json(['message' => 'Ticket called', 'ticket' => $nextTicket]);
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

        return response()->json(['message' => 'Ticket skipped', 'ticket' => $ticket]);
    }

    public function caterTicket($ticketId, $counterId)
    {
        $ticket = Ticket::findOrFail($ticketId);
        $counter = Counter::findOrFail($counterId);

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

        return response()->json(['message' => 'Queue reset successfully']);
    }
}

