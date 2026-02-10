<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inscriptions', function (Blueprint $table) {
            // Ajouter formation_id si elle n'existe pas
            if (!Schema::hasColumn('inscriptions', 'formation_id')) {
                $table->unsignedBigInteger('formation_id')->nullable()->after('etudiant_id');
                $table->foreign('formation_id')->references('id')->on('formations')->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        // Ne rien faire - cette migration est irréversible
    }
};
