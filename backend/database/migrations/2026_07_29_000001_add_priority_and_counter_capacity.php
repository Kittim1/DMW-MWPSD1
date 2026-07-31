<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('tickets', 'is_priority')) {
            Schema::table('tickets', function (Blueprint $table) {
                $table->boolean('is_priority')->default(false)->after('helpdesk_type');
                $table->string('priority_type', 50)->nullable()->after('is_priority');
            });
        }

        if (!Schema::hasColumn('counters', 'max_concurrent')) {
            Schema::table('counters', function (Blueprint $table) {
                $table->unsignedTinyInteger('max_concurrent')->default(1)->after('current_ticket_id');
            });
        }

        // Give Counter 5 (BM with Appointments) capacity of 2 simultaneous tickets, since
        // in the real office it's staffed by 2 people helping each other.
        DB::table('counters')->where('id', 5)->update(['max_concurrent' => 2]);

        // If there are exactly 5 counters and counter 5 lacks a user_id already,
        // leave user assignment to the dashboard. The QueueController capacity check
        // now uses max_concurrent instead of the singular current_ticket_id presence.
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['is_priority', 'priority_type']);
        });
        Schema::table('counters', function (Blueprint $table) {
            $table->dropColumn(['max_concurrent']);
        });
    }
};
