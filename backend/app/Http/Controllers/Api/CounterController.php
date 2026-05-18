<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Counter;
use Illuminate\Http\Request;

class CounterController extends Controller
{
    public function getCounters()
    {
        $counters = Counter::with('user')
            ->get(['id', 'counter_name', 'user_id', 'is_active', 'current_ticket_id']);

        return response()->json($counters);
    }

    public function updateCounter($id, Request $request)
    {
        $counter = Counter::findOrFail($id);

        $validated = $request->validate([
            'counter_name' => 'sometimes|string',
            'is_active' => 'sometimes|boolean',
        ]);

        $counter->update($validated);

        return response()->json($counter);
    }
}
