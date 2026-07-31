<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use App\Models\Ticket;
use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class QueueController extends Controller
{
    // Updated counter-service assignments as of 2026-07-29:
    // Counter 1: BM (w/o appt), Inquiry, OEC, Account Retrieval, PEOS
    //            Forwards: BM (with appt) → Counter 5, Direct Hire/G2G → Counter 4
    // Counter 2: (w/o appt), Inquiry, OEC, Account Retrieval, PEOS
    //            Forwards: BM (with appt) → Counter 5, Direct Hire/G2G → Counter 4
    // Counter 1: Help Desk / OEC / AR / PEOS + BM (without appointment)
    // Counter 2: Help Desk / OEC / AR / PEOS + BM (without appointment)
    // Counter 3: Info Sheet
    // Counter 4: Direct Hire, G to G
    // Counter 5: BM (with Appointments)
    private function counterServicesMap(int $counterId): array
    {
        $services = [
            1 => ['Balik Manggagawa', 'Help Desk', 'Overseas Employment Certificate', 'Account Retrieval', 'PEOS'],
            2 => ['Balik Manggagawa', 'Help Desk', 'Overseas Employment Certificate', 'Account Retrieval', 'PEOS'],
            3 => ['Information Sheet'],
            4 => ['Direct Hire', 'G to G'],
            5 => ['Balik Manggagawa'],
        ];
        return $services[$counterId] ?? [];
    }

    // Determine if BM is "with appointment" (true) or "without appointment" (false)
    // based on ticket fields.
    private function isBmWithAppointment($ticket): bool
    {
        if (isset($ticket['has_appointment'])) {
            return (bool) $ticket['has_appointment'];
        }
        if (is_object($ticket) && property_exists($ticket, 'has_appointment')) {
            return (bool) $ticket->has_appointment;
        }
        return false;
    }

    // Given a ticket (object or array) and a counter ID, check if the counter
    // is allowed to cater that ticket per the updated assignments.
    private function counterCanCaterTicket($ticket, int $counterId): bool
    {
        $serviceType = is_array($ticket) ? ($ticket['service_type'] ?? null) : ($ticket->service_type ?? null);
        $allowedServices = $this->counterServicesMap($counterId);

        // Counters 1 & 2 share the same core pool including BM WITHOUT appointment.
        if ($counterId === 1 || $counterId === 2) {
            if ($serviceType === 'Balik Manggagawa') {
                // Counter 1 & 2: only BM WITHOUT appointment (Counter 5 handles WITH)
                return !$this->isBmWithAppointment($ticket);
            }
            return in_array($serviceType, $allowedServices);
        }

        if ($counterId === 3) {
            return $serviceType === 'Information Sheet';
        }

        if ($counterId === 4) {
            // Counter 4: Direct Hire and G to G ONLY (never BM)
            return in_array($serviceType, ['Direct Hire', 'G to G']);
        }

        if ($counterId === 5) {
            if ($serviceType === 'Balik Manggagawa') {
                return $this->isBmWithAppointment($ticket);
            }
            return false;
        }

        // For any other counter IDs, allow if in the service map
        return in_array($serviceType, $allowedServices);
    }

    // Assign the correct counters for a new ticket given its primary service
    // and auxiliary data (has_appointment, etc.). Returns array of counter IDs.
    private function assignCountersForTicket(string $primaryService, array $data): array
    {
        if ($primaryService === 'Balik Manggagawa') {
            $hasAppointment = (bool)($data['has_appointment'] ?? false);
            // BM WITH appointment → Counter 5 only
            if ($hasAppointment) {
                return [5];
            }
            // BM WITHOUT appointment → Counters 1 and 2 (shared pool)
            return [1, 2];
        }

        if ($primaryService === 'Information Sheet') {
            return [3];
        }

        if ($primaryService === 'Help Desk') {
            // Inquiry/Help Desk → Counters 1 & 2
            return [1, 2];
        }

        if ($primaryService === 'Overseas Employment Certificate' ||
            $primaryService === 'Account Retrieval' ||
            $primaryService === 'PEOS') {
            return [1, 2];
        }

        if ($primaryService === 'Direct Hire' || $primaryService === 'G to G') {
            // Counter 4 ONLY — BM (which goes to Counter 5 / 1+2) must be
            // Balik Manggagawa service type, never Direct Hire.
            return [4];
        }

        return [1, 2];
    }

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
        // We no longer auto-generate 50 tickets - guard creates them one by one
        return;
    }

    public function getWaiting()
    {
        $this->initializeSessionTickets();

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $tickets = Ticket::with('services')
            ->where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('is_priority', 'desc')
            ->orderBy('priority_number', 'asc')
            ->get();

        return response()->json($tickets->map(function ($ticket) {
            return [
                'ticket_id' => $ticket->id,
                'priority_number' => $ticket->priority_number,
                'ticket_identifier' => $ticket->ticket_identifier,
                'counter_id' => $ticket->counter_id,
                'status' => $ticket->status,
                'service_type' => $ticket->service_type,
                'services' => $ticket->services->pluck('name'),
                'has_appointment' => (bool) $ticket->has_appointment,
                'client_name' => $ticket->client_name,
                'scheduled_time' => $ticket->scheduled_time,
                'scheduled_day' => $ticket->scheduled_day,
                'helpdesk_type' => $ticket->helpdesk_type,
                'assigned_counter_ids' => $ticket->assigned_counter_ids,
                'is_priority' => (bool) $ticket->is_priority,
                'priority_type' => $ticket->priority_type,
            ];
        }));
    }

    public function getServing()
    {
        $this->initializeSessionTickets();

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $tickets = Ticket::with('services')
            ->where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_SERVING)
            ->orderBy('is_priority', 'desc')
            ->orderBy('called_at', 'asc')
            ->get();

        return response()->json($tickets->map(function ($ticket) {
            return [
                'ticket_id' => $ticket->id,
                'priority_number' => $ticket->priority_number,
                'ticket_identifier' => $ticket->ticket_identifier,
                'counter_id' => $ticket->counter_id,
                'status' => $ticket->status,
                'service_type' => $ticket->service_type,
                'services' => $ticket->services->pluck('name'),
                'has_appointment' => (bool) $ticket->has_appointment,
                'client_name' => $ticket->client_name,
                'scheduled_time' => $ticket->scheduled_time,
                'scheduled_day' => $ticket->scheduled_day,
                'helpdesk_type' => $ticket->helpdesk_type,
                'assigned_counter_ids' => $ticket->assigned_counter_ids,
                'is_priority' => (bool) $ticket->is_priority,
                'priority_type' => $ticket->priority_type,
            ];
        }));
    }

    public function getStatus()
    {
        $this->initializeSessionTickets();

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $servingQuery = Ticket::with('services')
            ->where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_SERVING)
            ->orderBy('is_priority', 'desc')
            ->orderBy('called_at', 'asc');

        $waitingQuery = Ticket::with('services')
            ->where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING)
            ->orderBy('is_priority', 'desc')
            ->orderBy('priority_number', 'asc');

        $skippedQuery = Ticket::with('services')
            ->where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_SKIPPED)
            ->orderBy('is_priority', 'desc')
            ->orderBy('updated_at', 'desc');

        $serving = $servingQuery->get()->map(function ($ticket) {
            return [
                'ticket_id' => $ticket->id,
                'priority_number' => $ticket->priority_number,
                'ticket_identifier' => $ticket->ticket_identifier,
                'counter_id' => $ticket->counter_id,
                'status' => $ticket->status,
                'service_type' => $ticket->service_type,
                'services' => $ticket->services->pluck('name'),
                'has_appointment' => (bool) $ticket->has_appointment,
                'client_name' => $ticket->client_name,
                'scheduled_time' => $ticket->scheduled_time,
                'scheduled_day' => $ticket->scheduled_day,
                'helpdesk_type' => $ticket->helpdesk_type,
                'assigned_counter_ids' => $ticket->assigned_counter_ids,
                'is_priority' => (bool) $ticket->is_priority,
                'priority_type' => $ticket->priority_type,
            ];
        });

        $waiting = $waitingQuery->get()->map(function ($ticket) {
            return [
                'ticket_id' => $ticket->id,
                'priority_number' => $ticket->priority_number,
                'ticket_identifier' => $ticket->ticket_identifier,
                'counter_id' => $ticket->counter_id,
                'status' => $ticket->status,
                'service_type' => $ticket->service_type,
                'services' => $ticket->services->pluck('name'),
                'has_appointment' => (bool) $ticket->has_appointment,
                'client_name' => $ticket->client_name,
                'scheduled_time' => $ticket->scheduled_time,
                'scheduled_day' => $ticket->scheduled_day,
                'helpdesk_type' => $ticket->helpdesk_type,
                'assigned_counter_ids' => $ticket->assigned_counter_ids,
                'is_priority' => (bool) $ticket->is_priority,
                'priority_type' => $ticket->priority_type,
            ];
        });

        $skipped = $skippedQuery->get()->map(function ($ticket) {
            return [
                'ticket_id' => $ticket->id,
                'priority_number' => $ticket->priority_number,
                'ticket_identifier' => $ticket->ticket_identifier,
                'counter_id' => $ticket->counter_id,
                'status' => $ticket->status,
                'service_type' => $ticket->service_type,
                'services' => $ticket->services->pluck('name'),
                'has_appointment' => (bool) $ticket->has_appointment,
                'client_name' => $ticket->client_name,
                'scheduled_time' => $ticket->scheduled_time,
                'scheduled_day' => $ticket->scheduled_day,
                'helpdesk_type' => $ticket->helpdesk_type,
                'assigned_counter_ids' => $ticket->assigned_counter_ids,
                'is_priority' => (bool) $ticket->is_priority,
                'priority_type' => $ticket->priority_type,
            ];
        });

        // New: Get counts for individual counters and session totals
        $dailyTickets = Ticket::where('session_date', $sessionDate)->get();
        
        $counterCounts = [];
        for ($i = 1; $i <= 8; $i++) {
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
        $user = $counter->user;

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        // Maximum concurrent tickets this counter can handle (Counter 5 = 2 people)
        $maxConcurrent = (int) ($counter->max_concurrent ?? 1);
        if ($maxConcurrent < 1) {
            $maxConcurrent = 1;
        }

        // Count how many tickets this counter is ALREADY serving right now.
        $servingCount = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('counter_id', $counterId)
            ->where('status', Ticket::STATUS_SERVING)
            ->count();

        // Also clear stale single-field current_ticket_id if its ticket is no longer SERVING
        if ($counter->current_ticket_id) {
            $currentTicket = Ticket::find($counter->current_ticket_id);
            if (!$currentTicket ||
                $currentTicket->session_date !== $sessionDate ||
                $currentTicket->session_type !== $sessionType ||
                $currentTicket->status !== Ticket::STATUS_SERVING) {
                $counter->update(['current_ticket_id' => null]);
                $counter->refresh();
                // Adjust serving count after unlinking stale one
                $servingCount = max(0, $servingCount - 1);
            }
        }

        if ($servingCount >= $maxConcurrent) {
            return response()->json([
                'message' => "Counter {$counterId} is already serving {$servingCount}/{$maxConcurrent} ticket(s). Complete one first.",
            ], 400);
        }

        // Build ticket query
        $ticketQuery = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('status', Ticket::STATUS_WAITING);

        // Updated logic: filter by counter ID using the new counter-service assignment rules.
        // Primary filter: ticket is assigned to this counter OR the ticket's service+data is
        // compatible with this counter per counterServicesMap() rules.
        $allowedServices = $this->counterServicesMap($counterId);
        $ticketQuery->where(function ($q) use ($counterId, $allowedServices) {
            // Clause 1: ticket explicitly lists this counter in assigned_counter_ids
            $q->whereJsonContains('assigned_counter_ids', $counterId)
              ->orWhereRaw('JSON_CONTAINS(assigned_counter_ids, ?)', [json_encode($counterId)])
              ->orWhere('assigned_counter_ids', 'LIKE', '%[' . $counterId . '%')
              ->orWhere('assigned_counter_ids', 'LIKE', '%,' . $counterId . '%');

            // Clause 2: ticket's service type is generally allowed for this counter,
            // AND any BM-with-appt / BM-without-appt distinction is respected.
            if (count($allowedServices) > 0) {
                $q->orWhere(function ($q2) use ($counterId, $allowedServices) {
                    $q2->whereIn('service_type', $allowedServices);

                    if ($counterId === 1 || $counterId === 2) {
                        // Counters 1 and 2 share pool: allowed services list already
                        // includes BM, but BM here MUST be WITHOUT appointment.
                        $q2->where(function ($q3) {
                            $q3->where(function ($q4) {
                                $q4->where('service_type', '!=', 'Balik Manggagawa');
                            })->orWhere(function ($q4) {
                                $q4->where('service_type', 'Balik Manggagawa')
                                   ->where(function ($q5) {
                                       $q5->whereNull('has_appointment')
                                          ->orWhere('has_appointment', 0);
                                   });
                            });
                        });
                    }

                    if ($counterId === 5) {
                        $q2->where(function ($q3) {
                            $q3->where('service_type', 'Balik Manggagawa')
                               ->where('has_appointment', 1);
                        });
                    }
                });
            }
        });

        // Priority tickets first (PWD / Senior / Pregnant), then by priority number
        $ticketQuery->orderBy('is_priority', 'desc')
                    ->orderBy('priority_number', 'asc');

        $nextTicket = $ticketQuery->first();

        if (!$nextTicket) {
            return response()->json(['message' => 'No more tickets in queue'], 404);
        }

        $nextTicket->update([
            'status' => Ticket::STATUS_SERVING,
            'counter_id' => $counterId,
            'called_at' => now(),
        ]);
        
        // Refresh the ticket to get updated data
        $nextTicket->refresh();

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
            $counterId = $ticket->counter_id;

            // If this counter still has other tickets being SERVING (Counter 5 can have 2),
            // keep current_ticket_id set to the OLDEST remaining one; otherwise clear it.
            $stillServing = Ticket::where('session_date', $this->getCurrentSessionDate())
                ->where('session_type', $this->getCurrentSessionType())
                ->where('counter_id', $counterId)
                ->where('status', Ticket::STATUS_SERVING)
                ->orderBy('called_at', 'asc')
                ->first();

            $counter = Counter::find($counterId);
            if ($counter) {
                $counter->update(['current_ticket_id' => $stillServing ? $stillServing->id : null]);
            }

            // Log the action
            SystemLog::create([
                'user_id' => auth()->id(),
                'action' => 'completed',
                'details' => "Counter {$counterId} completed the transaction for priority number {$ticket->priority_number}"
            ]);
        }

        return response()->json(['message' => 'Service completed', 'ticket' => $ticket]);
    }

    public function skipTicket($ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);
        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $ticket->update([
            'status' => Ticket::STATUS_SKIPPED,
            'counter_id' => null, // Remove from counter when skipped
        ]);

        // If the counter was pointing to this ticket, either repoint to the next oldest
        // still-serving ticket or clear if nothing remains.
        $affected = Counter::where('current_ticket_id', $ticketId)->first();
        if ($affected) {
            $stillServing = Ticket::where('session_date', $sessionDate)
                ->where('session_type', $sessionType)
                ->where('counter_id', $affected->id)
                ->where('status', Ticket::STATUS_SERVING)
                ->where('id', '!=', $ticketId)
                ->orderBy('called_at', 'asc')
                ->first();
            $affected->update(['current_ticket_id' => $stillServing ? $stillServing->id : null]);
        }

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
        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        $ticket->update([
            'status' => Ticket::STATUS_CANCELLED,
            'counter_id' => null,
        ]);

        // Repoint current_ticket_id of the counter (if any) to next oldest still serving
        $affected = Counter::where('current_ticket_id', $ticketId)->first();
        if ($affected) {
            $stillServing = Ticket::where('session_date', $sessionDate)
                ->where('session_type', $sessionType)
                ->where('counter_id', $affected->id)
                ->where('status', Ticket::STATUS_SERVING)
                ->where('id', '!=', $ticketId)
                ->orderBy('called_at', 'asc')
                ->first();
            $affected->update(['current_ticket_id' => $stillServing ? $stillServing->id : null]);
        }

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

        // Maximum concurrent tickets this counter can handle (Counter 5 = 2)
        $maxConcurrent = (int) ($counter->max_concurrent ?? 1);
        if ($maxConcurrent < 1) {
            $maxConcurrent = 1;
        }

        // Count how many tickets are already serving on this counter
        $servingCount = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('counter_id', $counterId)
            ->where('status', Ticket::STATUS_SERVING)
            ->count();

        // Clear stale current_ticket_id if needed
        if ($counter->current_ticket_id) {
            $currentServing = Ticket::find($counter->current_ticket_id);
            if (!$currentServing ||
                $currentServing->session_date !== $sessionDate ||
                $currentServing->session_type !== $sessionType ||
                $currentServing->status !== Ticket::STATUS_SERVING) {
                $counter->update(['current_ticket_id' => null]);
                $counter->refresh();
                $servingCount = max(0, $servingCount - 1);
            }
        }

        if ($servingCount >= $maxConcurrent) {
            return response()->json([
                'message' => "Counter {$counterId} is already serving {$servingCount}/{$maxConcurrent} ticket(s). Complete one first.",
            ], 400);
        }

        // Check if counter is allowed to cater this ticket (updated rules based on counter ID)
        try {
            $assignedCounterIds = json_decode($ticket->assigned_counter_ids, true) ?? [];
        } catch (\Exception $e) {
            $assignedCounterIds = [];
        }
        if (!is_array($assignedCounterIds)) {
            $assignedCounterIds = [];
        }
        $isExplicitlyAssigned = count($assignedCounterIds) > 0 && in_array($counterId, $assignedCounterIds);
        $counterCanServe = $this->counterCanCaterTicket($ticket, $counterId);

        if (!$isExplicitlyAssigned && !$counterCanServe) {
            $allowedServices = $this->counterServicesMap($counterId);
            $allowedList = implode(', ', $allowedServices) . ($counterId === 1 ? ' (BM w/o appt only)' : '') . ($counterId === 5 ? ' (BM w/ appt only)' : '');
            return response()->json([
                'message' => 'Counter ' . $counterId . ' can only cater: ' . $allowedList . '. Use forward to send to correct counter.',
            ], 403);
        }

        $ticket->update([
            'status' => Ticket::STATUS_SERVING,
            'counter_id' => $counterId,
            'called_at' => now(),
        ]);

        // Refresh the ticket to get updated data
        $ticket->refresh();

        // Keep current_ticket_id pointing at the *oldest* ticket this counter is still serving
        $otherServing = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('counter_id', $counterId)
            ->where('status', Ticket::STATUS_SERVING)
            ->orderBy('called_at', 'asc')
            ->first();
        if ($otherServing) {
            $counter->update(['current_ticket_id' => $otherServing->id]);
        }

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
        $primaryService = $request->input('service_names')[0] ?? null;

        $rules = [
            'service_names' => 'required|array|min:1|max:7',
            'service_names.*' => 'string',
            'has_appointment' => 'nullable|boolean',
            'client_name' => 'nullable|string',
            'scheduled_time' => 'nullable|string',
            'scheduled_day' => 'nullable|string',
            'helpdesk_type' => 'nullable|string',
            'is_priority' => 'nullable|boolean',
            'priority_type' => 'nullable|string|max:50',
        ];

        // For Direct Hire and G to G: client_name is optional here (some flows
        // collect it on the guard, others don't — backend accepts both).
        // (No strict requirement added at this layer.)

        $validated = $request->validate($rules);

        $sessionDate = $this->getCurrentSessionDate();
        $sessionType = $this->getCurrentSessionType();

        // Generate ticket identifier
        $servicePrefixes = [
            'Balik Manggagawa' => 'BM',
            'Direct Hire' => 'DH',
            'G to G' => 'G2G',
            'Information Sheet' => 'IS',
            'Help Desk' => 'HD',
            'Overseas Employment Certificate' => 'OEC',
            'Account Retrieval' => 'AR',
            'PEOS' => 'PEOS',
        ];

        $prefix = $servicePrefixes[$primaryService] ?? 'GEN';
        
        // Get the last ticket for this service type to increment number
        $lastServiceTicket = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->where('service_type', $primaryService)
            ->whereNotNull('ticket_identifier')
            ->orderBy('priority_number', 'desc')
            ->first();
        
        $serviceNum = 1;
        if ($lastServiceTicket && $lastServiceTicket->ticket_identifier) {
            $parts = explode('-', $lastServiceTicket->ticket_identifier);
            if (count($parts) >= 2 && is_numeric($parts[1])) {
                $serviceNum = (int)$parts[1] + 1;
            }
        }
        $ticketIdentifier = $prefix . '-' . str_pad($serviceNum, 3, '0', STR_PAD_LEFT);

        // Find the highest priority number in the current session and increment
        $lastTicket = Ticket::where('session_date', $sessionDate)
            ->where('session_type', $sessionType)
            ->orderBy('priority_number', 'desc')
            ->first();

        $nextNumber = $lastTicket ? (int)$lastTicket->priority_number + 1 : 1;
        $priorityNumber = str_pad($nextNumber, 2, '0', STR_PAD_LEFT);

        // Assign based on the updated counter-service rules (Counters 1-5)
        $assignedCounterIds = [];
        $clientName = $validated['client_name'] ?? null;

        // For Direct Hire / G to G, ensure client-provided name is used
        if ($primaryService === 'Direct Hire' || $primaryService === 'G to G') {
            $clientName = $validated['client_name'];
        }

        // Use the new assignment helper (Counter 4 for DH/G2G, Counter 5 for BM with appt, etc.)
        $assignedCounterIds = $this->assignCountersForTicket($primaryService, $validated);

        // Get service IDs from names
        $serviceIds = \App\Models\Service::whereIn('name', $validated['service_names'])->pluck('id');

        $ticket = Ticket::create([
            'priority_number' => $priorityNumber,
            'ticket_identifier' => $ticketIdentifier,
            'service_type' => $primaryService, // Keep for backward compatibility
            'session_date' => $sessionDate,
            'session_type' => $sessionType,
            'status' => Ticket::STATUS_WAITING,
            'has_appointment' => $validated['has_appointment'] ?? false,
            'client_name' => $clientName,
            'scheduled_time' => $validated['scheduled_time'] ?? null,
            'scheduled_day' => $validated['scheduled_day'] ?? null,
            'helpdesk_type' => $validated['helpdesk_type'] ?? null,
            'assigned_counter_ids' => json_encode($assignedCounterIds),
            'is_priority' => (bool) ($validated['is_priority'] ?? false),
            'priority_type' => $validated['priority_type'] ?? null,
        ]);

        $ticket->services()->attach($serviceIds);
        $ticket->load('services');

        return response()->json([
            ...$ticket->toArray(),
            'services' => $ticket->services->pluck('name')
        ], 201);
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
        $counterId = $request->query('counter_id');
        $now = now();

        $query = Ticket::query();

        if ($type === 'daily') {
            $query->whereDate('session_date', $now->toDateString());
        } elseif ($type === 'weekly') {
            $startOfWeek = $now->startOfWeek()->toDateString();
            $endOfWeek = $now->endOfWeek()->toDateString();
            $query->whereBetween('session_date', [$startOfWeek, $endOfWeek]);
        } elseif ($type === 'monthly') {
            $query->whereMonth('session_date', $now->month)
                  ->whereYear('session_date', $now->year);
        } elseif ($type === 'yearly') {
            $query->whereYear('session_date', $now->year);
        }

        if ($counterId) {
            $query->where('counter_id', $counterId);
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

        // Calculate service type breakdown
        $serviceTypeCounts = [];
        foreach (Ticket::SERVICE_TYPES as $serviceType) {
            $serviceTypeCounts[$serviceType] = $tickets
                ->where('service_type', $serviceType)
                ->where('status', Ticket::STATUS_COMPLETED)
                ->count();
        }

        // Calculate counter breakdown (if no counter_id provided)
        $counterBreakdown = [];
        if (!$counterId) {
            for ($i = 1; $i <= 5; $i++) {
                $counterBreakdown[$i] = [
                    'total' => $tickets->where('counter_id', $i)->count(),
                    'served' => $tickets->where('counter_id', $i)->where('status', Ticket::STATUS_COMPLETED)->count(),
                ];
            }
        }

        return response()->json([
            'totalTickets' => $tickets->count(),
            'served' => $tickets->where('status', Ticket::STATUS_COMPLETED)->count(),
            'skipped' => $tickets->where('status', Ticket::STATUS_SKIPPED)->count(),
            'cancelled' => $tickets->where('status', Ticket::STATUS_CANCELLED)->count(),
            'avgWaitTime' => $avgWaitTime,
            'serviceTypeCounts' => $serviceTypeCounts,
            'counterBreakdown' => $counterBreakdown,
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

    public function forwardTicket(Request $request, $ticketId)
    {
        $validated = $request->validate([
            'target_counter_id' => 'required|integer|exists:counters,id',
        ]);

        $ticket = Ticket::findOrFail($ticketId);
        $targetCounter = Counter::findOrFail($validated['target_counter_id']);

        // Update ticket status and assigned counter
        $ticket->update([
            'status' => Ticket::STATUS_WAITING,
            'counter_id' => null,
            'assigned_counter_ids' => json_encode([$validated['target_counter_id']]),
        ]);

        // Free up the current counter (if any)
        if ($ticket->counter_id) {
            Counter::where('current_ticket_id', $ticketId)->update(['current_ticket_id' => null]);
        }

        // Log the action
        SystemLog::create([
            'user_id' => auth()->id(),
            'action' => 'forwarded',
            'details' => "Priority number {$ticket->priority_number} was forwarded to counter {$validated['target_counter_id']}"
        ]);

        return response()->json(['message' => 'Ticket forwarded successfully', 'ticket' => $ticket]);
    }
}

