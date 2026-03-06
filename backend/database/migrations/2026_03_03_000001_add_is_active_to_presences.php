<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter is_active si n'existe pas
        if (!Schema::hasColumn('presences', 'is_active')) {
            Schema::table('presences', function (Blueprint $table) {
                $table->boolean('is_active')->default(true)->after('statut')->comment('Automatiquement actif si formation commence');
            });
        }
    }

    public function down(): void
    {
        Schema::table('presences', function (Blueprint $table) {
            if (Schema::hasColumn('presences', 'is_active')) {
                $table->dropColumnIfExists('is_active');
            }
        });
    }
};
