<?php

namespace App\Http\Controllers;

use App\Models\GelombangPpdb;
use App\Models\KategoriSiswa;
use App\Models\PendaftaranPpdb;
use App\Models\Siswa;
use App\Models\Tagihan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Every other role already has its own dedicated dashboard
     * (staf_ppdb, staf_keuangan, wali_murid, siswa). guru has no
     * dashboard of its own yet, so it keeps landing on the plain
     * starter-kit placeholder below -- only admin and kepala_sekolah
     * get the school-wide snapshot this method builds.
     */
    public function index(Request $request): Response
    {
        if (! in_array($request->user()->role, ['admin', 'kepala_sekolah'], true)) {
            return Inertia::render('dashboard');
        }

        $totalSiswaAktif = Siswa::where('status', 'aktif')->count();
        $totalSiswaCalon = Siswa::where('status', 'calon')->count();

        $gelombangAktif = GelombangPpdb::openNow()->orderBy('tanggal_mulai')->first();
        $totalPendaftarGelombangBerjalan = $gelombangAktif
            ? PendaftaranPpdb::where('gelombang_ppdb_id', $gelombangAktif->id)->count()
            : 0;

        $totalTagihanBelumLunas = Tagihan::where('status', '!=', 'lunas')
            ->get(['nominal', 'terbayar'])
            ->sum(fn (Tagihan $t) => $t->nominal - $t->terbayar);

        $siswaPerKategori = Siswa::query()
            ->leftJoin('kategori_siswa', 'kategori_siswa.id', '=', 'siswa.kategori_siswa_id')
            ->selectRaw('kategori_siswa.nama as nama, count(*) as total')
            ->groupBy('kategori_siswa.nama')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->nama ?? 'tanpa_kategori',
                'label' => $row->nama ?? 'Belum Ada Kategori',
                'value' => (int) $row->total,
            ])
            ->values();

        $statusUrutan = ['belum_bayar', 'sebagian', 'lunas'];

        $jumlahPerStatus = Tagihan::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $tagihanPerStatus = collect($statusUrutan)
            ->map(fn (string $status) => [
                'name' => $status,
                'value' => $jumlahPerStatus->get($status, 0),
            ])
            ->values();

        return Inertia::render('dashboard', [
            'ringkasan' => [
                'totalSiswaAktif' => $totalSiswaAktif,
                'totalPendaftarGelombangBerjalan' => $totalPendaftarGelombangBerjalan,
                'totalTagihanBelumLunas' => $totalTagihanBelumLunas,
                'totalSiswaCalon' => $totalSiswaCalon,
                'siswaPerKategori' => $siswaPerKategori,
                'tagihanPerStatus' => $tagihanPerStatus,
            ],
        ]);
    }
}
