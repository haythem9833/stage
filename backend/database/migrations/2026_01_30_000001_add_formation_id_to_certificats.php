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
        Schema::table('certificats', function (Blueprint $table) {
            if (!Schema::hasColumn('certificats', 'formation_id')) {
                $table->foreignId('formation_id')->nullable()->constrained('formations')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('certificats', function (Blueprint $table) {
            if (Schema::hasColumn('certificats', 'formation_id')) {
                $table->dropForeignIdFor(\App\Models\Formation::class, 'formation_id');
            }
        });
    }
};
