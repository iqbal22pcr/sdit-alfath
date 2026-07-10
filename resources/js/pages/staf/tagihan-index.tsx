import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';

interface TagihanRow {
    id: number;
    nomor_tagihan: string;
    nominal: number;
    terbayar: number;
    status: StatusTagihan;
    created_at: string;
    siswa: { nama: string };
    komponen_biaya: { nama: string; jenis: string };
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kelola Tagihan', href: '/staf/tagihan' }];

export default function StafTagihanIndex({ tagihan }: { tagihan: TagihanRow[] }) {
    const [statusFilter, setStatusFilter] = useState<StatusTagihan | 'semua'>('semua');

    const filteredTagihan = useMemo(
        () => (statusFilter === 'semua' ? tagihan : tagihan.filter((t) => t.status === statusFilter)),
        [tagihan, statusFilter],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Tagihan" />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Kelola Tagihan" description="Kelola tagihan pembayaran siswa dan pantau status pelunasannya." />

                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusTagihan | 'semua')}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua Status</SelectItem>
                            {(Object.keys(STATUS_LABEL) as StatusTagihan[]).map((status) => (
                                <SelectItem key={status} value={status}>
                                    {STATUS_LABEL[status]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nomor Tagihan</TableHead>
                                <TableHead>Nama Siswa</TableHead>
                                <TableHead>Komponen Biaya</TableHead>
                                <TableHead>Nominal</TableHead>
                                <TableHead>Terbayar</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTagihan.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <EmptyState title="Belum ada tagihan." />
                                    </TableCell>
                                </TableRow>
                            )}

                            {filteredTagihan.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.nomor_tagihan}</TableCell>
                                    <TableCell>{t.siswa.nama}</TableCell>
                                    <TableCell>{t.komponen_biaya.nama}</TableCell>
                                    <TableCell>{formatRupiah(t.nominal)}</TableCell>
                                    <TableCell>{formatRupiah(t.terbayar)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusBadgeClass(t.status)}>
                                            {STATUS_LABEL[t.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('staf.tagihan.show', t.id)}>Detail</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
