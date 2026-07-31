<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->enum('service_type', [
                'Overseas Employment Certificate',
                'Information Sheet',
                'Account Retrieval',
                'PEOS',
                'Balik Manggagawa',
                'Direct Hire',
                'G to G'
            ])->nullable()->after('priority_number');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('service_type');
        });
    }
};
