<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajouter une colonne inscription_id si elle n'existe pas
        Schema::table('certificats', function (Blueprint $table) {
            if (!Schema::hasColumn('certificats', 'inscription_id')) {
                $table->foreignId('inscription_id')
                    ->nullable()
                    ->constrained('inscriptions')
                    ->onDelete('cascade')
                    ->after('id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('certificats', function (Blueprint $table) {
            if (Schema::hasColumn('certificats', 'inscription_id')) {
                $table->dropForeignIdFor('inscriptions');
                $table->dropColumn('inscription_id');
            }
        });
    }
};
