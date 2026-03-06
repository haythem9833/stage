<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter formation_id à la table evaluations
        if (Schema::hasTable('evaluations')) {
            Schema::table('evaluations', function (Blueprint $table) {
                if (!Schema::hasColumn('evaluations', 'formation_id')) {
                    $table->foreignId('formation_id')
                        ->nullable()
                        ->after('inscrit_id')
                        ->constrained('formations')
                        ->onDelete('cascade');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('evaluations')) {
            Schema::table('evaluations', function (Blueprint $table) {
                if (Schema::hasColumn('evaluations', 'formation_id')) {
                    $table->dropForeignIdFor('formations', 'formation_id');
                    $table->dropColumn('formation_id');
                }
            });
        }
    }
};
