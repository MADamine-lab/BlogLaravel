// database/migrations/xxxx_xx_xx_xxxxxx_add_status_to_users_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('password');
            // status options: pending, active, suspended
            $table->text('suspension_reason')->nullable()->after('status');
            $table->timestamp('approved_at')->nullable()->after('suspension_reason');
            $table->timestamp('suspended_at')->nullable()->after('approved_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'suspension_reason', 'approved_at', 'suspended_at']);
        });
    }
};