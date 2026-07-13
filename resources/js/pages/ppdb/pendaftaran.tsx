import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { MetricCard } from '@/components/metric-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, FileWarning } from 'lucide-react';

type Status = 'draft' | 'diajukan' | 'diverifikasi' | 'perlu_perbaikan' | 'diterima' | 'ditolak';

interface PendaftaranRow {
    id: number;
    nomor_pendaftaran: string;
    nama_pendaftar: string;
    status: Status;
    catatan_verifikasi: string | null;
    siswa: { status: 'calon' | 'aktif' | 'alumni' | 'keluar' } | null;
    created_at: string;
}

interface Ringkasan {
    total: number;
    perluPerbaikan: number;
    diterima: number;
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

export default function PpdbPendaftaran({ pendaftaran, ringkasan }: { pendaftaran: PendaftaranRow[]; ringkasan: Ringkasan }) {
    const perluPerbaikan = pendaftaran.filter((p) => p.status === 'perlu_perbaikan' && p.catatan_verifikasi);

    return (
        <>
            <Head title="Pendaftaran" />

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Heading title="Pendaftaran" description="Pantau status pendaftaran PPDB anak Anda dari waktu ke waktu." />

                    <Button asChild>
                        <Link href={route('ppdb.create')}>+ Tambah Pendaftaran</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MetricCard icon={ClipboardList} tone="blue" label="Total Pendaftaran" value={ringkasan.total} />
                    <MetricCard icon={FileWarning} tone="gold" label="Perlu Perbaikan" value={ringkasan.perluPerbaikan} />
                    <MetricCard icon={CheckCircle2} tone="green" label="Diterima" value={ringkasan.diterima} />
                </div>

                {perluPerbaikan.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {perluPerbaikan.map((p) => (
                            <Alert key={p.id} className="border-[var(--border-warning)] bg-[var(--bg-warning)] text-[var(--text-warning)]">
                                <AlertTitle>
                                    Perlu Perbaikan &mdash; {p.nomor_pendaftaran} ({p.nama_pendaftar})
                                </AlertTitle>
                                <AlertDescription className="text-[var(--text-warning)]">{p.catatan_verifikasi}</AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted">
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
                                    <TableRow key={p.id}>
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
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PpdbPendaftaran.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
