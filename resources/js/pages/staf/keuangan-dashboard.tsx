import { DonutChart } from '@/components/charts/donut-chart';
import { HorizontalBarChart, type BarDatum } from '@/components/charts/horizontal-bar-chart';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { MetricCard } from '@/components/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatRupiahSingkat, formatTanggal } from '@/lib/format';
import { statusChartColor } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, Banknote, CheckCircle2, Receipt } from 'lucide-react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';
type JenisKomponen = 'masuk' | 'buku' | 'seragam' | 'spp';

interface BreakdownRow<T extends string> {
    name: T;
    value: number;
}

interface Ringkasan {
    totalBelumLunas: number;
    totalTerbayar: number;
    sppTertunggak: number;
    jumlahJatuhTempoLewat: number;
}

interface AkanJatuhTempoRow {
    id: number;
    namaSiswa: string;
    nominalSisa: number;
    jatuhTempo: string;
}

interface TahunAjaranOption {
    id: number;
    nama: string;
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const JENIS_LABEL: Record<JenisKomponen, string> = {
    masuk: 'Uang Masuk',
    buku: 'Uang Buku',
    seragam: 'Uang Seragam',
    spp: 'SPP Bulanan',
};

const JENIS_CHART_COLOR: Record<JenisKomponen, string> = {
    masuk: 'var(--chart-1)',
    buku: 'var(--chart-2)',
    seragam: 'var(--chart-3)',
    spp: 'var(--chart-4)',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/staf/keuangan-dashboard' }];

export default function StafKeuanganDashboard({
    ringkasan,
    statusBreakdown,
    statusJenisScope,
    nominalPerJenis,
    akanJatuhTempo,
    tahunAjaranScope,
    tahunAjaranList,
    tahunAjaranIdUntukLink,
}: {
    ringkasan: Ringkasan;
    statusBreakdown: BreakdownRow<StatusTagihan>[];
    statusJenisScope: JenisKomponen | 'semua';
    nominalPerJenis: BreakdownRow<JenisKomponen>[];
    akanJatuhTempo: AkanJatuhTempoRow[];
    tahunAjaranScope: string;
    tahunAjaranList: TahunAjaranOption[];
    tahunAjaranIdUntukLink: string;
}) {
    // tahun_ajaran and status_jenis are independent filters that both live
    // on this same page, so every navigation must resend both -- otherwise
    // changing one would silently reset the other back to its default.
    const navigate = (overrides: Partial<{ tahun_ajaran: string; status_jenis: string }>) => {
        router.get(
            route('staf.keuangan-dashboard'),
            { tahun_ajaran: tahunAjaranScope, status_jenis: statusJenisScope, ...overrides },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const setScope = (value: string) => navigate({ tahun_ajaran: value });
    const setStatusJenisScope = (value: string) => navigate({ status_jenis: value });

    const detailHref = (params: Record<string, string>) =>
        route('staf.tagihan.index', { tahun_ajaran_id: tahunAjaranIdUntukLink, ...params });

    return (
        <>
            <Head title="Dashboard Keuangan" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Dashboard Keuangan" description="Ringkasan tagihan dan pembayaran siswa." />

                    <Select value={tahunAjaranScope} onValueChange={setScope}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Tahun Ajaran" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="aktif">Tahun Ajaran Aktif</SelectItem>
                            <SelectItem value="semua">Semua Tahun Ajaran</SelectItem>
                            {tahunAjaranList.map((t) => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                    {t.nama}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        icon={Receipt}
                        tone="blue"
                        label="Total Tagihan Belum Lunas"
                        value={formatRupiah(ringkasan.totalBelumLunas)}
                        href={detailHref({ status: 'belum_lunas' })}
                    />
                    <MetricCard
                        icon={CheckCircle2}
                        tone="green"
                        label="Total Tagihan Terbayar"
                        value={formatRupiah(ringkasan.totalTerbayar)}
                        href={detailHref({})}
                    />
                    <MetricCard
                        icon={Banknote}
                        tone="gold"
                        label="SPP Tertunggak"
                        value={formatRupiah(ringkasan.sppTertunggak)}
                        href={detailHref({ jenis: 'spp', status: 'belum_lunas' })}
                    />
                    <MetricCard
                        icon={AlertTriangle}
                        tone="red"
                        label="Uang Masuk Jatuh Tempo"
                        value={ringkasan.jumlahJatuhTempoLewat}
                        href={detailHref({ jenis: 'masuk', overdue: '1' })}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle className="text-base">Breakdown Status Tagihan</CardTitle>

                            <Select value={statusJenisScope} onValueChange={setStatusJenisScope}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Jenis Komponen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Jenis</SelectItem>
                                    <SelectItem value="spp">SPP</SelectItem>
                                    <SelectItem value="masuk">Uang Masuk</SelectItem>
                                    <SelectItem value="buku">Uang Buku</SelectItem>
                                    <SelectItem value="seragam">Uang Seragam</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                data={statusBreakdown.map((row) => ({
                                    key: row.name,
                                    label: STATUS_LABEL[row.name],
                                    value: row.value,
                                    color: statusChartColor(row.name),
                                }))}
                            />
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Total Nominal per Jenis Komponen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HorizontalBarChart
                                data={nominalPerJenis.map(
                                    (row): BarDatum => ({
                                        key: row.name,
                                        label: JENIS_LABEL[row.name],
                                        value: row.value,
                                        color: JENIS_CHART_COLOR[row.name],
                                    }),
                                )}
                                valueFormatter={formatRupiah}
                                labelFormatter={formatRupiahSingkat}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-base">Tagihan Akan Jatuh Tempo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Siswa</TableHead>
                                    <TableHead>Nominal Sisa</TableHead>
                                    <TableHead>Jatuh Tempo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {akanJatuhTempo.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3}>
                                            <EmptyState title="Tidak ada tagihan yang akan jatuh tempo dalam waktu dekat." />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    akanJatuhTempo.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">{row.namaSiswa}</TableCell>
                                            <TableCell>{formatRupiah(row.nominalSisa)}</TableCell>
                                            <TableCell>{formatTanggal(row.jatuhTempo)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

StafKeuanganDashboard.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
