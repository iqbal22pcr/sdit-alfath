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
    username_siswa: string | null;
    siswa: { status: 'calon' | 'aktif' | 'alumni' | 'keluar' } | null;
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pendaftaran', href: '/ppdb/pendaftaran' }];

export default function PpdbPendaftaran({ pendaftaran }: { pendaftaran: PendaftaranRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendaftaran" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Pendaftaran" description="Pantau status pendaftaran PPDB anak Anda dari waktu ke waktu." />

                    <Button asChild>
                        <Link href={route('ppdb.create')}>+ Tambah Pendaftaran</Link>
                    </Button>
                </div>

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

                                    {p.siswa?.status === 'aktif' && p.username_siswa && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={5} className="pt-0">
                                                <Alert className="border-green-500/50 bg-green-50 text-green-800 dark:border-green-500/50 dark:bg-green-950/40 dark:text-green-200">
                                                    <AlertTitle>Akun Anak Sudah Aktif</AlertTitle>
                                                    <AlertDescription className="text-green-800 dark:text-green-200">
                                                        Login menggunakan username: {p.username_siswa}
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
