<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('presences')) {
            Schema::table('presences', function (Blueprint $table) {
                // Rendre session_id nullable puisque nous utilisons maintenant formations au lieu de sessions
                $table->unsignedBigInteger('session_id')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('presences')) {
            Schema::table('presences', function (Blueprint $table) {
                $table->unsignedBigInteger('session_id')->nullable(false)->change();
            });
        }
    }
};
