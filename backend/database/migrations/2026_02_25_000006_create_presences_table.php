<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('presences')) {
            Schema::create('presences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('inscription_id')->constrained('inscriptions')->cascadeOnDelete();
                $table->foreignId('session_id')->constrained('session_formations')->cascadeOnDelete();
                $table->date('date_session');
                $table->enum('statut', ['present', 'absent', 'retard', 'justifie'])->default('present');
                $table->text('justification')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('inscription_id');
                $table->index('session_id');
                $table->index('date_session');
                $table->unique(['inscription_id', 'session_id', 'date_session']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('presences');
    }
};
