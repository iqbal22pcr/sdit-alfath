import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Status = 'draft' | 'diajukan' | 'diverifikasi' | 'perlu_perbaikan' | 'diterima' | 'ditolak';

interface KuotaKategoriSummary {
    kategori: string;
    total: number;
    terpakai: number;
    sisa: number;
}

interface PendaftaranRow {
    id: number;
    nomor_pendaftaran: string;
    nama_pendaftar: string;
    status: Status;
    created_at: string;
    user: { name: string };
    kategori_siswa: { nama: string } | null;
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard PPDB', href: '/staf/ppdb-dashboard' }];

const formatTanggal = (value: string) =>
    new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

export default function StafPpdbDashboard({
    gelombang,
    kuotaPerKategori,
    pendaftaran,
}: {
    gelombang: { id: number; nama: string } | null;
    kuotaPerKategori: KuotaKategoriSummary[];
    pendaftaran: PendaftaranRow[];
}) {
    const [statusFilter, setStatusFilter] = useState<Status | 'semua'>('semua');

    const filteredPendaftaran = useMemo(
        () => (statusFilter === 'semua' ? pendaftaran : pendaftaran.filter((p) => p.status === statusFilter)),
        [pendaftaran, statusFilter],
    );

    if (! gelombang) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard PPDB" />
                <div className="p-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tidak Ada Gelombang PPDB yang Sedang Buka</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard PPDB" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-xl font-semibold">Dashboard PPDB</h1>
                    <p className="text-sm text-muted-foreground">Gelombang: {gelombang.nama}</p>
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-medium text-muted-foreground">Status Kuota per Kategori</h2>

                    {kuotaPerKategori.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada kuota yang diatur untuk gelombang ini.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {kuotaPerKategori.map((kuota) => (
                                <KuotaCard key={kuota.kategori} {...kuota} />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            Daftar Pendaftar <span className="text-xs">(maks. 50 terbaru)</span>
                        </h2>

                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as Status | 'semua')}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Status</SelectItem>
                                {(Object.keys(STATUS_LABEL) as Status[]).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {STATUS_LABEL[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nomor Pendaftaran</TableHead>
                                    <TableHead>Nama Pendaftar</TableHead>
                                    <TableHead>Akun Wali</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Daftar</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPendaftaran.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                                            Tidak ada pendaftar.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {filteredPendaftaran.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.nomor_pendaftaran}</TableCell>
                                        <TableCell>{p.nama_pendaftar}</TableCell>
                                        <TableCell>{p.user.name}</TableCell>
                                        <TableCell>
                                            {p.kategori_siswa ? p.kategori_siswa.nama : <span className="text-muted-foreground">Belum ditentukan</span>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_BADGE_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                                        </TableCell>
                                        <TableCell>{formatTanggal(p.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('staf.ppdb.verifikasi', p.id)}>Verifikasi</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function KuotaCard({ kategori, total, terpakai, sisa }: KuotaKategoriSummary) {
    const penuh = terpakai >= total;
    const persentase = total > 0 ? Math.min(100, Math.round((terpakai / total) * 100)) : 0;

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{kategori}</CardTitle>
                    <Badge variant={penuh ? 'destructive' : 'default'}>{penuh ? 'Penuh' : 'Tersedia'}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold">
                    {terpakai} <span className="text-sm font-normal text-muted-foreground">/ {total}</span>
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className={cn('h-full rounded-full transition-all', penuh ? 'bg-destructive' : 'bg-primary')}
                        style={{ width: `${persentase}%` }}
                    />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Sisa: {sisa}</p>
            </CardContent>
        </Card>
    );
}
