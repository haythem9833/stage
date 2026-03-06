<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'is_formateur')) {
                $table->boolean('is_formateur')->default(false)->after('role');
            }
            if (!Schema::hasColumn('users', 'jours_disponibles')) {
                $table->json('jours_disponibles')->nullable()->after('is_formateur');
            }
            if (!Schema::hasColumn('users', 'heure_debut_prefere')) {
                $table->string('heure_debut_prefere')->default('08:00')->after('jours_disponibles');
            }
            if (!Schema::hasColumn('users', 'heure_fin_prefere')) {
                $table->string('heure_fin_prefere')->default('17:00')->after('heure_debut_prefere');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_formateur')) {
                $table->dropColumn('is_formateur');
            }
            if (Schema::hasColumn('users', 'jours_disponibles')) {
                $table->dropColumn('jours_disponibles');
            }
            if (Schema::hasColumn('users', 'heure_debut_prefere')) {
                $table->dropColumn('heure_debut_prefere');
            }
            if (Schema::hasColumn('users', 'heure_fin_prefere')) {
                $table->dropColumn('heure_fin_prefere');
            }
        });
    }
};
