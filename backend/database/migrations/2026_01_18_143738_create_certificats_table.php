<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('certificats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('session_formation_id')->constrained('session_formations')->onDelete('cascade');
            $table->string('numero_certificat')->unique();
            $table->date('date_emission');
            $table->string('chemin_fichier')->nullable();
            $table->timestamps();
            $table->unique(['etudiant_id', 'session_formation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificats');
    }
};
