<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The cicilan mechanism (rencana_cicilan + item_cicilan) is being
     * replaced entirely by a single jatuh_tempo column on tagihan --
     * see add_jatuh_tempo_to_tagihan_table. pembayaran.item_cicilan_id
     * FKs into item_cicilan, so that FK (and the now-meaningless
     * column itself, since nothing will ever reference an item
     * cicilan again) has to go before item_cicilan can be dropped;
     * item_cicilan itself has to go before rencana_cicilan for the
     * same FK-ordering reason.
     */
    public function up(): void
    {
        Schema::table('pembayaran', function (Blueprint $table) {
            $table->dropForeign(['item_cicilan_id']);
            $table->dropColumn('item_cicilan_id');
        });

        Schema::dropIfExists('item_cicilan');
        Schema::dropIfExists('rencana_cicilan');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('rencana_cicilan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tagihan_id')->unique()->constrained('tagihan');
            $table->foreignId('dibuat_oleh')->constrained('users');
            $table->unsignedTinyInteger('jumlah_cicilan');
            $table->timestamps();
        });

        Schema::create('item_cicilan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rencana_cicilan_id')->constrained('rencana_cicilan')->cascadeOnDelete();
            $table->unsignedTinyInteger('cicilan_ke');
            $table->date('jatuh_tempo');
            $table->unsignedInteger('nominal');
            $table->enum('status', ['belum_bayar', 'lunas'])->default('belum_bayar');
            $table->timestamps();
        });

        Schema::table('pembayaran', function (Blueprint $table) {
            $table->foreignId('item_cicilan_id')->nullable()->after('tagihan_id')->constrained('item_cicilan');
        });
    }
};
