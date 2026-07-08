<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * All foreign keys here are left at the default RESTRICT behaviour
     * on purpose (no cascadeOnDelete): a pembayaran is real financial
     * record data, it must never silently vanish just because the
     * tagihan, item_cicilan, or staff user it references gets deleted.
     */
    public function up(): void
    {
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tagihan_id')->constrained('tagihan');
            $table->foreignId('item_cicilan_id')->nullable()->constrained('item_cicilan');
            $table->foreignId('diterima_oleh')->constrained('users');
            $table->string('nomor_pembayaran')->unique();
            $table->unsignedInteger('nominal');
            $table->date('tanggal_bayar');
            $table->enum('metode', ['tunai', 'transfer']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};
