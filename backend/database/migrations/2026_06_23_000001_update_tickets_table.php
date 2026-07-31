<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('ticket_identifier')->nullable();
            $table->boolean('has_appointment')->default(false);
            $table->string('client_name')->nullable();
            $table->string('scheduled_time')->nullable();
            $table->string('scheduled_day')->nullable();
            $table->string('helpdesk_type')->nullable();
            $table->string('assigned_counter_ids')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'ticket_identifier',
                'has_appointment',
                'client_name',
                'scheduled_time',
                'scheduled_day',
                'helpdesk_type',
                'assigned_counter_ids'
            ]);
        });
    }
};
