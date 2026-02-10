<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter les colonnes pour la phase d'évaluation
        Schema::table('formations', function (Blueprint $table) {
            if (!Schema::hasColumn('formations', 'statut')) {
                $table->enum('statut', ['planifiee', 'en_cours', 'evaluation', 'terminee', 'annulee'])
                    ->default('planifiee')
                    ->after('description');
            }
            
            if (!Schema::hasColumn('formations', 'date_debut')) {
                $table->date('date_debut')->nullable()->after('statut');
            }
            
            if (!Schema::hasColumn('formations', 'date_fin')) {
                $table->date('date_fin')->nullable()->after('date_debut');
            }
            
            if (!Schema::hasColumn('formations', 'date_debut_evaluation')) {
                $table->date('date_debut_evaluation')->nullable()->after('date_fin');
            }
            
            if (!Schema::hasColumn('formations', 'date_fin_evaluation')) {
                $table->date('date_fin_evaluation')->nullable()->after('date_debut_evaluation');
            }
        });

        // Mettre à jour la table evaluations avec les champs détaillés
        Schema::table('evaluations', function (Blueprint $table) {
            if (!Schema::hasColumn('evaluations', 'environnement_note')) {
                $table->integer('environnement_note')->nullable()->min(0)->max(5)->after('note');
                $table->text('environnement_commentaire')->nullable()->after('environnement_note');
            }
            
            if (!Schema::hasColumn('evaluations', 'formateur_note')) {
                $table->integer('formateur_note')->nullable()->min(0)->max(5)->after('environnement_commentaire');
                $table->text('formateur_commentaire')->nullable()->after('formateur_note');
            }
            
            if (!Schema::hasColumn('evaluations', 'formation_note')) {
                $table->integer('formation_note')->nullable()->min(0)->max(5)->after('formateur_commentaire');
                $table->text('formation_commentaire')->nullable()->after('formation_note');
            }
            
            if (!Schema::hasColumn('evaluations', 'services_note')) {
                $table->integer('services_note')->nullable()->min(0)->max(5)->after('formation_commentaire');
                $table->text('services_commentaire')->nullable()->after('services_note');
            }
            
            if (!Schema::hasColumn('evaluations', 'suggestions')) {
                $table->text('suggestions')->nullable()->after('services_commentaire');
            }
            
            if (!Schema::hasColumn('evaluations', 'status')) {
                $table->enum('status', ['incomplete', 'completed', 'cancelled'])->default('incomplete')->after('suggestions');
            }
            
            if (!Schema::hasColumn('evaluations', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('formations', function (Blueprint $table) {
            if (Schema::hasColumn('formations', 'statut')) {
                $table->dropColumn('statut');
            }
            if (Schema::hasColumn('formations', 'date_debut')) {
                $table->dropColumn('date_debut');
            }
            if (Schema::hasColumn('formations', 'date_fin')) {
                $table->dropColumn('date_fin');
            }
            if (Schema::hasColumn('formations', 'date_debut_evaluation')) {
                $table->dropColumn('date_debut_evaluation');
            }
            if (Schema::hasColumn('formations', 'date_fin_evaluation')) {
                $table->dropColumn('date_fin_evaluation');
            }
        });

        Schema::table('evaluations', function (Blueprint $table) {
            $columns = [
                'environnement_note', 'environnement_commentaire',
                'formateur_note', 'formateur_commentaire',
                'formation_note', 'formation_commentaire',
                'services_note', 'services_commentaire',
                'suggestions', 'status', 'submitted_at'
            ];
            
            foreach ($columns as $column) {
                if (Schema::hasColumn('evaluations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
