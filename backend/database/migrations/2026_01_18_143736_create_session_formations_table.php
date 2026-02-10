<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('session_formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('formation_id')->constrained('formations')->onDelete('cascade');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->string('lieu')->nullable();
            $table->integer('nombre_places')->default(25);
            $table->enum('statut', ['planifiee', 'en_cours', 'validee', 'annulee'])->default('planifiee');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_formations');
    }
};
