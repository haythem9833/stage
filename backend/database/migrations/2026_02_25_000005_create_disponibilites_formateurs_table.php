<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('disponibilites_formateurs')) {
            Schema::create('disponibilites_formateurs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('formateur_id')->constrained('users')->cascadeOnDelete();
                $table->dateTime('date_debut');
                $table->dateTime('date_fin');
                $table->enum('type', ['disponibilite', 'indisponibilite', 'preferee'])->default('indisponibilite');
                $table->string('raison')->nullable();
                $table->enum('recurrence', ['once', 'daily', 'weekly', 'monthly'])->default('once');
                $table->timestamps();

                $table->index('formateur_id');
                $table->index(['formateur_id', 'date_debut']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('disponibilites_formateurs');
    }
};
