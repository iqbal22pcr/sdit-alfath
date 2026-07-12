import { DonutChart, type DonutSlice } from '@/components/charts/donut-chart';
import { HorizontalBarChart, type BarDatum } from '@/components/charts/horizontal-bar-chart';
import Heading from '@/components/heading';
import { MetricCard } from '@/components/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/format';
import { statusChartColor } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ClipboardList, Hourglass, Users, Wallet } from 'lucide-react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';

interface KategoriSiswaBreakdown {
    name: string;
    label: string;
    value: number;
}

interface StatusBreakdownRow {
    name: StatusTagihan;
    value: number;
}

interface Ringkasan {
    totalSiswaAktif: number;
    totalPendaftarGelombangBerjalan: number;
    totalTagihanBelumLunas: number;
    totalSiswaCalon: number;
    siswaPerKategori: KategoriSiswaBreakdown[];
    tagihanPerStatus: StatusBreakdownRow[];
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

// Real categories cycle through the brand categorical palette in a fixed
// order; the "no category assigned" bucket always gets the neutral
// slate color instead of taking a slot in that cycle.
const KATEGORI_PALETTE = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

function kategoriDonutData(rows: KategoriSiswaBreakdown[]): DonutSlice[] {
    let paletteIndex = 0;

    return rows.map((row) => {
        const color = row.name === 'tanpa_kategori' ? 'var(--chart-5)' : KATEGORI_PALETTE[paletteIndex++ % KATEGORI_PALETTE.length];

        return { key: row.name, label: row.label, value: row.value, color };
    });
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({ ringkasan }: { ringkasan?: Ringkasan }) {
    if (! ringkasan) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    const tagihanBarData: BarDatum[] = ringkasan.tagihanPerStatus.map((row) => ({
        key: row.name,
        label: STATUS_LABEL[row.name],
        value: row.value,
        color: statusChartColor(row.name),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">
                <Heading title="Dashboard Sekolah" description="Ringkasan kondisi sekolah saat ini." />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard icon={Users} tone="blue" label="Siswa Aktif" value={ringkasan.totalSiswaAktif} />
                    <MetricCard icon={ClipboardList} tone="gold" label="Pendaftar PPDB Aktif" value={ringkasan.totalPendaftarGelombangBerjalan} />
                    <MetricCard icon={Wallet} tone="red" label="Tagihan Belum Lunas" value={formatRupiah(ringkasan.totalTagihanBelumLunas)} />
                    <MetricCard icon={Hourglass} tone="green" label="Siswa Calon" value={ringkasan.totalSiswaCalon} />
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Siswa per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart data={kategoriDonutData(ringkasan.siswaPerKategori)} emptyLabel="Belum ada siswa." />
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Tagihan per Status (Semua Siswa)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HorizontalBarChart data={tagihanBarData} emptyLabel="Belum ada tagihan." />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
