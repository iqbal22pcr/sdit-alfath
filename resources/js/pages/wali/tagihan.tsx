import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

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

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tagihan', href: '/wali/tagihan' }];

export default function WaliTagihanIndex({ tagihan }: { tagihan: TagihanRow[] }) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tagihan" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Tagihan" description="Pantau tagihan dan status pembayaran seluruh anak Anda." />

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
