<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ressources')) {
            Schema::create('ressources', function (Blueprint $table) {
                $table->id();
                // If `salles` table exists, create a proper foreign key. Otherwise create a nullable unsignedBigInteger.
                if (Schema::hasTable('salles')) {
                    $table->foreignId('salle_id')->constrained('salles')->cascadeOnDelete();
                } else {
                    $table->unsignedBigInteger('salle_id')->nullable();
                }
                $table->string('nom');
                $table->enum('type', ['equipement', 'mobilier', 'logiciel', 'autre']);
                $table->integer('quantite')->default(1);
                $table->enum('etat', ['operational', 'maintenance', 'hors_service'])->default('operational');
                $table->text('notes')->nullable();
                $table->timestamps();

                $table->index('salle_id');
                $table->index('type');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ressources');
    }
};
