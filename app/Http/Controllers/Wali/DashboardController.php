<?php

namespace App\Http\Controllers\Wali;

use App\Http\Controllers\Controller;
use App\Models\PendaftaranPpdb;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the wali's dashboard: a personal greeting, an upcoming
     * "uang masuk" due-date alert, aggregate tagihan metrics across
     * every child, and a per-child status card.
     *
     * "Anak" here means every pendaftaran_ppdb this wali has ever
     * submitted, not just the ones already converted into a siswa --
     * a registration still awaiting verification is still "their
     * child" from the wali's point of view.
     */
    public function index(Request $request): Response
    {
        $userId = $request->user()->id;

        $pendaftaran = PendaftaranPpdb::where('user_id', $userId)
            ->with([
                'siswa:id,pendaftaran_ppdb_id,nama,status',
                'siswa.tagihan:id,siswa_id,komponen_biaya_id,nominal,terbayar,status',
                'siswa.tagihan.komponenBiaya:id,jenis',
            ])
            ->latest()
            ->get(['id', 'nama_pendaftar', 'status']);

        $tagihanBelumLunas = Tagihan::whereHas('siswa.pendaftaranPpdb', fn ($q) => $q->where('user_id', $userId))
            ->where('status', '!=', 'lunas')
            ->get(['id', 'siswa_id', 'nominal', 'terbayar']);

        $jatuhTempoSegera = Tagihan::whereHas('siswa.pendaftaranPpdb', fn ($q) => $q->where('user_id', $userId))
            ->whereHas('komponenBiaya', fn ($q) => $q->where('jenis', 'masuk'))
            ->where('status', '!=', 'lunas')
            ->whereNotNull('jatuh_tempo')
            ->whereBetween('jatuh_tempo', [now()->startOfDay(), now()->addDays(14)->endOfDay()])
            ->with('siswa:id,nama')
            ->orderBy('jatuh_tempo')
            ->get(['id', 'siswa_id', 'jatuh_tempo']);

        $anak = $pendaftaran->map(function (PendaftaranPpdb $p) {
            $siswa = $p->siswa;

            if (! $siswa) {
                return [
                    'nama' => $p->nama_pendaftar,
                    'tipe' => 'pendaftaran',
                    'status' => $p->status,
                    'konteks' => null,
                ];
            }

            $konteks = null;

            if ($siswa->status === 'calon') {
                // Mirrors Siswa::bisaAktivasiOtomatis()'s two onboarding
                // gates, but reported as independent progress instead
                // of a single AND'd boolean.
                $bukuLunas = $siswa->tagihan->contains(fn (Tagihan $t) => $t->komponenBiaya->jenis === 'buku' && $t->status === 'lunas');
                $seragamLunas = $siswa->tagihan->contains(fn (Tagihan $t) => $t->komponenBiaya->jenis === 'seragam' && $t->status === 'lunas');

                $konteks = [
                    'jenis' => 'progres_aktivasi',
                    'terpenuhi' => ($bukuLunas ? 1 : 0) + ($seragamLunas ? 1 : 0),
                    'total' => 2,
                ];
            } elseif ($siswa->status === 'aktif') {
                $tagihanBelumLunasAnak = $siswa->tagihan->where('status', '!=', 'lunas');

                $konteks = [
                    'jenis' => 'tunggakan',
                    'jumlah_tagihan' => $tagihanBelumLunasAnak->count(),
                    'total_tunggakan' => $tagihanBelumLunasAnak->sum(fn (Tagihan $t) => $t->nominal - $t->terbayar),
                ];
            }

            return [
                'nama' => $siswa->nama,
                'tipe' => 'siswa',
                'status' => $siswa->status,
                'konteks' => $konteks,
            ];
        });

        return Inertia::render('wali/dashboard', [
            'namaWali' => $request->user()->name,
            'jumlahAnak' => $pendaftaran->count(),
            'jumlahTagihanBelumLunas' => $tagihanBelumLunas->count(),
            'totalTunggakan' => $tagihanBelumLunas->sum(fn (Tagihan $t) => $t->nominal - $t->terbayar),
            'alertJatuhTempo' => $jatuhTempoSegera->map(fn (Tagihan $t) => [
                'namaAnak' => $t->siswa->nama,
                'jatuhTempo' => $t->jatuh_tempo->toDateString(),
            ])->values(),
            'anak' => $anak->values(),
        ]);
    }
}
