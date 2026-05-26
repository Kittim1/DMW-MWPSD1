<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Counter;
use Illuminate\Http\Request;
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

        // Check if tickets already exist for this session
        $existingTickets = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->count();

        if ($existingTickets > 0) {
            return; // Tickets already initialized
        }

        // Generate tickets 01-50 for both morning and afternoon sessions
        for ($i = 1; $i <= 50; $i++) {
            Ticket::create([
                'priority_number' => str_pad($i, 2, '0', STR_PAD_LEFT),
                'session_date' => $sessionDate,
                'session_type' => $sessionType,
                'status' => Ticket::STATUS_WAITING,
            ]);
        }
    }

    public function getWaiting()
    {
        $this->initializeSessionTickets();

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $tickets = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('created_at', 'asc')
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

    public function callNext($counterId)
    {
        $this->initializeSessionTickets();

        $counter = Counter::findOrFail($counterId);

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $nextTicket = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('created_at', 'asc')
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
}

