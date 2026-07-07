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
     * on purpose (no cascadeOnDelete). A gelombang_ppdb that already
     * has registrations must never be deletable at all -- that will be
     * enforced manually in the controller, not via cascade, since a
     * cascade would silently wipe real applicant data.
     */
    public function up(): void
    {
        Schema::create('pendaftaran_ppdb', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('gelombang_ppdb_id')->constrained('gelombang_ppdb');
            $table->foreignId('kategori_siswa_id')->nullable()->constrained('kategori_siswa');
            $table->foreignId('diverifikasi_oleh')->nullable()->constrained('users');
            $table->string('nomor_pendaftaran')->unique();
            $table->string('nama_pendaftar');
            $table->date('tanggal_lahir');
            $table->string('tempat_lahir');
            $table->enum('jenis_kelamin', ['laki_laki', 'perempuan']);
            $table->text('alamat');
            $table->enum('status_ayah', ['hidup', 'meninggal']);
            $table->boolean('penghasilan_tetap');
            $table->boolean('punya_saudara_di_sekolah');
            $table->string('nama_saudara')->nullable();
            $table->enum('status', ['draft', 'diajukan', 'diverifikasi', 'perlu_perbaikan', 'diterima', 'ditolak'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pendaftaran_ppdb');
    }
};
