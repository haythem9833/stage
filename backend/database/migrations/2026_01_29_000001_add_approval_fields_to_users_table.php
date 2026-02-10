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
        Schema::table('users', function (Blueprint $table) {
            // If someone requests admin/formateur, we store the request here and keep role as-is until approved.
            $table->enum('account_status', ['approved', 'pending', 'rejected'])->default('approved')->after('role');
            $table->enum('requested_role', ['formateur', 'admin'])->nullable()->after('account_status');
            $table->timestamp('approved_at')->nullable()->after('requested_role');
            $table->foreignId('approved_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn(['account_status', 'requested_role', 'approved_at']);
        });
    }
};

