<?php

namespace App\Http\Controllers\Staf;

use App\Http\Controllers\Controller;
use App\Models\Tagihan;
use App\Models\TahunAjaran;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KeuanganDashboardController extends Controller
{
    /**
     * Snapshot of tagihan health for staf_keuangan: how many/how much
     * is still owed, how much has already come in, how many overdue
     * "uang masuk" tagihan need direct follow-up, the two status/jenis
     * breakdown charts, and the next 5 tagihan approaching their due
     * date -- everything scoped to whichever tahun_ajaran is selected
     * via the ?tahun_ajaran= query param.
     *
     * tahun_ajaran accepts "aktif" (default, the currently active
     * tahun_ajaran), "semua" (no scoping at all), or a tahun_ajaran id.
     * "aktif" is resolved to a concrete id up front so every query
     * below (and the tahun_ajaran_id sent to staf/tagihan for the
     * "Lihat Detail" links) shares one single source of truth for what
     * "aktif" means at request time.
     */
    public function index(Request $request): Response
    {
        $scope = $request->query('tahun_ajaran', 'aktif');
        $tahunAjaranAktif = TahunAjaran::where('status_aktif', true)->first();

        $tahunAjaranId = match (true) {
            $scope === 'semua' => null,
            $scope === 'aktif' => $tahunAjaranAktif?->id,
            default => (int) $scope,
        };

        $scoped = fn (Builder $query) => $query->when($tahunAjaranId !== null, fn ($q) => $q->where('tahun_ajaran_id', $tahunAjaranId));

        $belumLunas = $scoped(Tagihan::where('status', '!=', 'lunas'))->get(['nominal', 'terbayar']);

        $totalBelumLunas = $belumLunas->sum(fn (Tagihan $t) => $t->nominal - $t->terbayar);
        $totalTerbayar = (int) $scoped(Tagihan::query())->sum('terbayar');

        $sppTertunggak = $scoped(Tagihan::where('status', '!=', 'lunas'))
            ->whereHas('komponenBiaya', fn ($q) => $q->where('jenis', 'spp'))
            ->get(['nominal', 'terbayar'])
            ->sum(fn (Tagihan $t) => $t->nominal - $t->terbayar);

        $jumlahJatuhTempoLewat = $scoped(Tagihan::where('status', '!=', 'lunas'))
            ->whereNotNull('jatuh_tempo')
            ->where('jatuh_tempo', '<', now()->startOfDay())
            ->whereHas('komponenBiaya', fn ($q) => $q->where('jenis', 'masuk'))
            ->count();

        // Fixed orders (not the raw groupBy result) so chart segments stay
        // in the same sequence regardless of which statuses/jenis happen
        // to have rows right now.
        $statusUrutan = ['belum_bayar', 'sebagian', 'lunas'];

        // Independent of $tahunAjaranId scoping used for the bar chart and
        // metric cards -- this only narrows the status-breakdown donut.
        $statusJenisScope = $request->query('status_jenis', 'semua');

        $jumlahPerStatus = $scoped(Tagihan::query())
            ->when(
                $statusJenisScope !== 'semua',
                fn ($q) => $q->whereHas('komponenBiaya', fn ($q2) => $q2->where('jenis', $statusJenisScope))
            )
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $statusBreakdown = collect($statusUrutan)
            ->map(fn (string $status) => [
                'name' => $status,
                'value' => $jumlahPerStatus->get($status, 0),
            ])
            ->values();

        $jenisUrutan = ['masuk', 'buku', 'seragam', 'spp'];

        $nominalPerJenis = Tagihan::join('komponen_biaya', 'komponen_biaya.id', '=', 'tagihan.komponen_biaya_id')
            ->when($tahunAjaranId !== null, fn ($q) => $q->where('tagihan.tahun_ajaran_id', $tahunAjaranId))
            ->selectRaw('komponen_biaya.jenis as jenis, sum(tagihan.nominal) as total')
            ->groupBy('komponen_biaya.jenis')
            ->pluck('total', 'jenis');

        $nominalPerJenisBreakdown = collect($jenisUrutan)
            ->map(fn (string $jenis) => [
                'name' => $jenis,
                'value' => (int) $nominalPerJenis->get($jenis, 0),
            ])
            ->values();

        $akanJatuhTempo = $scoped(Tagihan::where('status', '!=', 'lunas'))
            ->whereNotNull('jatuh_tempo')
            ->where('jatuh_tempo', '>=', now()->startOfDay())
            ->whereHas('komponenBiaya', fn ($q) => $q->where('jenis', 'masuk'))
            ->with('siswa:id,nama')
            ->orderBy('jatuh_tempo')
            ->limit(5)
            ->get(['id', 'siswa_id', 'nominal', 'terbayar', 'jatuh_tempo'])
            ->map(fn (Tagihan $t) => [
                'id' => $t->id,
                'namaSiswa' => $t->siswa->nama,
                'nominalSisa' => $t->nominal - $t->terbayar,
                'jatuhTempo' => $t->jatuh_tempo->toDateString(),
            ])
            ->values();

        return Inertia::render('staf/keuangan-dashboard', [
            'ringkasan' => [
                'totalBelumLunas' => $totalBelumLunas,
                'totalTerbayar' => $totalTerbayar,
                'sppTertunggak' => $sppTertunggak,
                'jumlahJatuhTempoLewat' => $jumlahJatuhTempoLewat,
            ],
            'statusBreakdown' => $statusBreakdown,
            'statusJenisScope' => $statusJenisScope,
            'nominalPerJenis' => $nominalPerJenisBreakdown,
            'akanJatuhTempo' => $akanJatuhTempo,
            'tahunAjaranScope' => $scope,
            'tahunAjaranList' => TahunAjaran::orderByDesc('tahun_mulai')->get(['id', 'nama']),
            // Concrete tahun_ajaran_id value for the "Lihat Detail" links
            // on staf/tagihan, which only understands "semua" or a real
            // id -- it has no "aktif" pseudo-value of its own.
            'tahunAjaranIdUntukLink' => $tahunAjaranId !== null ? (string) $tahunAjaranId : 'semua',
        ]);
    }
}
