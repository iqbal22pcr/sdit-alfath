import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

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

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tagihan', href: '/wali/tagihan' }];

export default function WaliTagihanIndex({ tagihan, alertJatuhTempo }: { tagihan: TagihanRow[]; alertJatuhTempo: AlertJatuhTempo[] }) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tagihan" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Tagihan" description="Pantau tagihan dan status pembayaran seluruh anak Anda." />

                {alertJatuhTempo.length > 0 && (
                    <Alert className="border-amber-500/50 bg-amber-50 text-amber-800 dark:border-amber-500/50 dark:bg-amber-950/40 dark:text-amber-200">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                        <AlertTitle>Uang Masuk Segera Jatuh Tempo</AlertTitle>
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
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

                <div className="overflow-x-auto rounded-md border">
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
                </div>
            </div>
        </AppLayout>
    );
}
