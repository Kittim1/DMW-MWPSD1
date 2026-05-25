<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropUnique('tickets_priority_number_unique');
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->unique(['session_date', 'session_type', 'priority_number']);
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropUnique(['session_date', 'session_type', 'priority_number']);
        });

        Schema::table('tickets', function (Blueprint $table) {
            $table->unique(['priority_number']);
        });
    }
};
