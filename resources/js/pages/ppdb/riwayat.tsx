import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Fragment } from 'react';

type Status = 'draft' | 'diajukan' | 'diverifikasi' | 'perlu_perbaikan' | 'diterima' | 'ditolak';

interface PendaftaranRow {
    id: number;
    nomor_pendaftaran: string;
    nama_pendaftar: string;
    status: Status;
    catatan_verifikasi: string | null;
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Riwayat Pendaftaran PPDB', href: '/ppdb/riwayat' }];

export default function PpdbRiwayat({ pendaftaran }: { pendaftaran: PendaftaranRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pendaftaran PPDB" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Riwayat Pendaftaran PPDB" description="Pantau status pendaftaran PPDB anak Anda dari waktu ke waktu." />

                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nomor Pendaftaran</TableHead>
                                <TableHead>Nama Pendaftar</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal Daftar</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendaftaran.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <EmptyState
                                            title="Belum ada pendaftaran."
                                            action={{ label: 'Daftar PPDB', href: route('ppdb.create') }}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}

                            {pendaftaran.map((p) => (
                                <Fragment key={p.id}>
                                    <TableRow>
                                        <TableCell className="font-medium">{p.nomor_pendaftaran}</TableCell>
                                        <TableCell>{p.nama_pendaftar}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusBadgeClass(p.status)}>
                                                {STATUS_LABEL[p.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatTanggal(p.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            {p.status === 'perlu_perbaikan' && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('ppdb.perbaiki', p.id)}>Perbaiki Sekarang</Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>

                                    {p.status === 'perlu_perbaikan' && p.catatan_verifikasi && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={5} className="pt-0">
                                                <Alert className="border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:border-yellow-500/50 dark:bg-yellow-950/40 dark:text-yellow-200">
                                                    <AlertTitle>Perlu Perbaikan</AlertTitle>
                                                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                                                        {p.catatan_verifikasi}
                                                    </AlertDescription>
                                                </Alert>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
