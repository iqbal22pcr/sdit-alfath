import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type Status = 'draft' | 'diajukan' | 'diverifikasi' | 'perlu_perbaikan' | 'diterima' | 'ditolak';

interface PendaftaranRow {
    id: number;
    nomor_pendaftaran: string;
    nama_pendaftar: string;
    status: Status;
    created_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
    draft: 'Draft',
    diajukan: 'Diajukan',
    diverifikasi: 'Diverifikasi',
    perlu_perbaikan: 'Perlu Perbaikan',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
};

const STATUS_BADGE_VARIANT: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'secondary',
    diajukan: 'secondary',
    diverifikasi: 'outline',
    perlu_perbaikan: 'outline',
    diterima: 'default',
    ditolak: 'destructive',
};

const formatTanggal = (value: string) =>
    new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Riwayat Pendaftaran PPDB', href: '/ppdb/riwayat' }];

export default function PpdbRiwayat({ pendaftaran }: { pendaftaran: PendaftaranRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pendaftaran PPDB" />

            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-xl font-semibold">Riwayat Pendaftaran PPDB</h1>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nomor Pendaftaran</TableHead>
                                <TableHead>Nama Pendaftar</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal Daftar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendaftaran.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Belum ada pendaftaran.
                                    </TableCell>
                                </TableRow>
                            )}

                            {pendaftaran.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.nomor_pendaftaran}</TableCell>
                                    <TableCell>{p.nama_pendaftar}</TableCell>
                                    <TableCell>
                                        <Badge variant={STATUS_BADGE_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                                    </TableCell>
                                    <TableCell>{formatTanggal(p.created_at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
