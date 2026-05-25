<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->date('session_date')->default(now())->after('priority_number');
            $table->enum('session_type', ['morning', 'afternoon'])->default('morning')->after('session_date');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn(['session_date', 'session_type']);
        });
    }
};
