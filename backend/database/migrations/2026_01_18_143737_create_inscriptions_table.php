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
        Schema::create('inscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_formation_id')->constrained('session_formations')->onDelete('cascade');
            $table->foreignId('etudiant_id')->constrained('users')->onDelete('cascade');
            $table->enum('statut', ['en_attente', 'acceptee', 'rejetee', 'terminez'])->default('en_attente');
            $table->decimal('note', 5, 2)->nullable();
            $table->date('date_inscription')->useCurrent();
            $table->timestamps();
            $table->unique(['etudiant_id', 'session_formation_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inscriptions');
    }
};
