<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Rendre session_formation_id nullable pour backward compatibility
        Schema::table('inscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('inscriptions', 'session_formation_id')) {
                $table->foreignId('session_formation_id')
                    ->nullable()
                    ->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('inscriptions', function (Blueprint $table) {
            if (Schema::hasColumn('inscriptions', 'session_formation_id')) {
                $table->foreignId('session_formation_id')->change();
            }
        });
    }
};
