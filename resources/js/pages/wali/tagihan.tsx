import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { MetricCard } from '@/components/metric-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, CircleDollarSign, Receipt } from 'lucide-react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';

interface TagihanRow {
    id: number;
    nomor_tagihan: string;
    nominal: number;
    terbayar: number;
    status: StatusTagihan;
    jatuh_tempo: string | null;
    siswa: { nama: string };
    komponen_biaya: { nama: string; jenis: string };
}

interface AlertJatuhTempo {
    namaAnak: string;
    jatuhTempo: string;
}

interface Ringkasan {
    belumBayar: number;
    sebagian: number;
    lunas: number;
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tagihan', href: '/wali/tagihan' }];

export default function WaliTagihanIndex({
    tagihan,
    alertJatuhTempo,
    ringkasan,
}: {
    tagihan: TagihanRow[];
    alertJatuhTempo: AlertJatuhTempo[];
    ringkasan: Ringkasan;
}) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tagihan" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Tagihan" description="Pantau tagihan dan status pembayaran seluruh anak Anda." />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard icon={Receipt} tone="red" label="Belum Bayar" value={ringkasan.belumBayar} />
                    <MetricCard icon={CircleDollarSign} tone="gold" label="Sebagian" value={ringkasan.sebagian} />
                    <MetricCard icon={CheckCircle2} tone="green" label="Lunas" value={ringkasan.lunas} />
                </div>

                {alertJatuhTempo.length > 0 && (
                    <Alert className="border-[var(--border-warning)] bg-[var(--bg-warning)] text-[var(--text-warning)]">
                        <AlertTriangle className="size-4 text-[var(--warning)]" />
                        <AlertTitle>Uang Masuk Segera Jatuh Tempo</AlertTitle>
                        <AlertDescription className="text-[var(--text-warning)]">
                            <ul className="list-disc space-y-1 pl-4">
                                {alertJatuhTempo.map((item, index) => (
                                    <li key={index}>
                                        <span className="font-medium">{item.namaAnak}</span> — jatuh tempo {formatTanggal(item.jatuhTempo)}
                                    </li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="rounded-xl">
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Anak</TableHead>
                                    <TableHead>Komponen Biaya</TableHead>
                                    <TableHead>Nominal</TableHead>
                                    <TableHead>Terbayar</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Jatuh Tempo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tagihan.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyState title="Belum ada tagihan." />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {tagihan.map((t) => (
                                    <TableRow
                                        key={t.id}
                                        className="cursor-pointer"
                                        onClick={() => router.visit(route('wali.tagihan.show', t.id))}
                                    >
                                        <TableCell className="font-medium">{t.siswa.nama}</TableCell>
                                        <TableCell>{t.komponen_biaya.nama}</TableCell>
                                        <TableCell>{formatRupiah(t.nominal)}</TableCell>
                                        <TableCell>{formatRupiah(t.terbayar)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusBadgeClass(t.status)}>
                                                {STATUS_LABEL[t.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{t.jatuh_tempo ? formatTanggal(t.jatuh_tempo) : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
