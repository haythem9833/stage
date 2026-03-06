<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('presences')) {
            Schema::table('presences', function (Blueprint $table) {
                // Ajouter formation_id si n'existe pas
                if (!Schema::hasColumn('presences', 'formation_id')) {
                    $table->foreignId('formation_id')->nullable()->constrained('formations')->cascadeOnDelete()->after('inscription_id');
                }
                
                // Rendre session_id nullable (en attente de suppression future)
                if (Schema::hasColumn('presences', 'session_id')) {
                    try {
                        $table->dropForeignKeyIfExists(['session_id']);
                    } catch (\Exception $e) {
                        // Foreign key might already be dropped
                    }
                }
            });

            // Recréer la contrainte d'unicité avec formation_id
            Schema::table('presences', function (Blueprint $table) {
                // Supprimer l'ancienne contrainte si elle existe
                try {
                    $table->dropUnique('presences_inscription_id_session_id_date_session_unique');
                } catch (\Exception $e) {
                    // Constraint might not exist
                }
                
                // Créer la nouvelle contrainte
                if (!Schema::hasTable('presences')) {
                    return;
                }
                
                // Ajouter la contrainte d'unicité pour formation_id
                $table->unique(['inscription_id', 'formation_id', 'date_session'], 'presences_inscription_formation_date_unique');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('presences')) {
            Schema::table('presences', function (Blueprint $table) {
                if (Schema::hasColumn('presences', 'formation_id')) {
                    $table->dropForeignKeyIfExists(['formation_id']);
                    $table->dropColumn('formation_id');
                }
                
                try {
                    $table->dropUnique('presences_inscription_formation_date_unique');
                } catch (\Exception $e) {
                    // Constraint might not exist
                }
            });
        }
    }
};
