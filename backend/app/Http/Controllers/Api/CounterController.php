<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use Illuminate\Http\Request;

class CounterController extends Controller
{
    public function getCounters()
    {
        $counters = Counter::with('user', 'currentTicket')
            ->get(['id', 'counter_name', 'user_id', 'is_active', 'current_ticket_id', 'max_concurrent']);

        return response()->json($counters);
    }

    public function updateCounter($id, Request $request)
    {
        $counter = Counter::findOrFail($id);

        $validated = $request->validate([
            'counter_name' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
            'max_concurrent' => 'sometimes|integer|min:1|max:4',
        ]);

        $counter->update($validated);

        return response()->json($counter);
    }
}
