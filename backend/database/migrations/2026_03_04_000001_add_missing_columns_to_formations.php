<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('formations')) {
            Schema::table('formations', function (Blueprint $table) {
                // Ajouter les colonnes manquantes si elles n'existent pas
                if (!Schema::hasColumn('formations', 'date_debut')) {
                    $table->date('date_debut')->nullable();
                }
                if (!Schema::hasColumn('formations', 'date_fin')) {
                    $table->date('date_fin')->nullable();
                }
                if (!Schema::hasColumn('formations', 'lieu')) {
                    $table->string('lieu')->nullable();
                }
                if (!Schema::hasColumn('formations', 'nombre_places')) {
                    $table->integer('nombre_places')->default(25);
                }
                if (!Schema::hasColumn('formations', 'statut')) {
                    $table->enum('statut', ['en_attente', 'en_cours', 'terminee'])->default('en_attente');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('formations')) {
            Schema::table('formations', function (Blueprint $table) {
                $table->dropColumn(['date_debut', 'date_fin', 'lieu', 'nombre_places', 'statut']);
            });
        }
    }
};
