<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter les colonnes nécessaires pour la gestion des sessions automatiques
        Schema::table('session_formations', function (Blueprint $table) {
            // Colonne pour tracker si la session a été créée automatiquement
            if (!Schema::hasColumn('session_formations', 'auto_created')) {
                $table->boolean('auto_created')->default(false)->after('statut');
            }
        });

        // Ajouter les colonnes pour les évaluations
        if (!Schema::hasTable('evaluations')) {
            Schema::create('evaluations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inscrit_id')->constrained('inscriptions')->onDelete('cascade');
                $table->foreignId('session_formation_id')->constrained('session_formations')->onDelete('cascade');
                $table->integer('note')->min(0)->max(5); // Note de 0 à 5
                $table->text('commentaire')->nullable();
                $table->timestamps();
                
                // Unique: un étudiant peut évaluer une session une seule fois
                $table->unique(['inscrit_id', 'session_formation_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::table('session_formations', function (Blueprint $table) {
            $table->dropColumn('auto_created');
        });

        Schema::dropIfExists('evaluations');
    }
};
