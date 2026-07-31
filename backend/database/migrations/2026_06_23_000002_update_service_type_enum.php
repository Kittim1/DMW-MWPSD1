<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('service_type')->nullable()->change();
        });
    }

    public function down(): void
    {
        // If we need to revert, we can change back to enum, but for simplicity, let's keep it as string
        Schema::table('tickets', function (Blueprint $table) {
            $table->enum('service_type', [
                'Overseas Employment Certificate',
                'Information Sheet',
                'Account Retrieval',
                'PEOS',
                'Balik Manggagawa',
                'Direct Hire',
                'G to G',
                'Help Desk'
            ])->nullable()->change();
        });
    }
};
