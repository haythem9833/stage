<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only for MySQL/MariaDB: Disable foreign key checks
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        // Supprimer l'ancienne contrainte unique si elle existe
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE certificats DROP INDEX IF EXISTS certificats_etudiant_id_session_formation_id_unique;');
            // Ajouter la nouvelle contrainte unique basée sur formation_id
            DB::statement('ALTER TABLE certificats ADD UNIQUE certificats_etudiant_id_formation_id_unique (etudiant_id, formation_id);');
        }

        // Rendre session_formation_id nullable
        Schema::table('certificats', function (Blueprint $table) {
            if (Schema::hasColumn('certificats', 'session_formation_id')) {
                $table->foreignId('session_formation_id')
                    ->nullable()
                    ->change();
            }
        });

        // Only for MySQL/MariaDB: Re-enable foreign key checks
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificats', function (Blueprint $table) {
            // Essayer de revenir à la contrainte originale
            try {
                $table->dropUnique(['etudiant_id', 'formation_id']);
            } catch (\Exception $e) {
                // Ignorer les erreurs
            }
        });
    }
};
