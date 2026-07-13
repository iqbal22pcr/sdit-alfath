import { DonutChart } from '@/components/charts/donut-chart';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/lib/format';
import { statusBadgeClass, statusChartColor } from '@/lib/status-badge';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Status = 'draft' | 'diajukan' | 'diverifikasi' | 'perlu_perbaikan' | 'diterima' | 'ditolak';

interface KuotaKategoriSummary {
    kategori: string;
    total: number;
    terpakai: number;
    sisa: number;
}

interface StatusBreakdownRow {
    name: Status;
    value: number;
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

interface SiswaPerluAktivasi {
    id: number;
    nama: string;
}

const STATUS_LABEL: Record<Status, string> = {
    draft: 'Draft',
    diajukan: 'Diajukan',
    diverifikasi: 'Diverifikasi',
    perlu_perbaikan: 'Perlu Perbaikan',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard PPDB', href: '/staf/ppdb-dashboard' }];

export default function StafPpdbDashboard({
    gelombang,
    kuotaPerKategori,
    statusBreakdown,
    pendaftaran,
    siswaPerluAktivasi,
}: {
    gelombang: { id: number; nama: string } | null;
    kuotaPerKategori: KuotaKategoriSummary[];
    statusBreakdown: StatusBreakdownRow[];
    pendaftaran: PendaftaranRow[];
    siswaPerluAktivasi: SiswaPerluAktivasi[];
}) {
    const [statusFilter, setStatusFilter] = useState<Status | 'semua'>('semua');

    const filteredPendaftaran = useMemo(
        () => (statusFilter === 'semua' ? pendaftaran : pendaftaran.filter((p) => p.status === statusFilter)),
        [pendaftaran, statusFilter],
    );

    if (!gelombang) {
        return (
            <>
                <Head title="Dashboard PPDB" />
                <div>
                    <Card>
                        <CardContent>
                            <EmptyState
                                title="Tidak ada gelombang PPDB yang sedang buka."
                                description="Buka gelombang baru dari halaman Gelombang PPDB untuk mulai menerima pendaftaran."
                            />
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Dashboard PPDB" />

            <div className="flex flex-col gap-6">
                <Heading title="Dashboard PPDB" description={`Gelombang: ${gelombang.nama}`} withSidebarTrigger />

                {siswaPerluAktivasi.length > 0 && (
                    <Alert className="border-[var(--border-warning)] bg-[var(--bg-warning)] text-[var(--text-warning)]">
                        <AlertTriangle className="size-4 text-[var(--warning)]" />
                        <AlertTitle>{siswaPerluAktivasi.length} Siswa Perlu Aktivasi Manual</AlertTitle>
                        <AlertDescription className="text-[var(--text-warning)]">
                            <p className="mb-2">
                                Sudah lunas uang buku dan uang seragam tapi masih berstatus calon -- aktivasi otomatis kemungkinan pernah gagal.
                            </p>
                            <ul className="space-y-1.5">
                                {siswaPerluAktivasi.map((s) => (
                                    <SiswaPerluAktivasiRow key={s.id} siswa={s} />
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Breakdown Status Pendaftaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DonutChart
                                data={statusBreakdown.map((row) => ({
                                    key: row.name,
                                    label: STATUS_LABEL[row.name],
                                    value: row.value,
                                    color: statusChartColor(row.name),
                                }))}
                            />
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Kuota Terpakai vs Sisa per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {kuotaPerKategori.length === 0 ? (
                                <p className="text-muted-foreground flex h-48 items-center justify-center text-sm">
                                    Belum ada kuota yang diatur untuk gelombang ini.
                                </p>
                            ) : (
                                <KuotaBarChart data={kuotaPerKategori} />
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h2 className="text-muted-foreground mb-3 text-sm font-medium">Status Kuota per Kategori</h2>

                    {kuotaPerKategori.length === 0 ? (
                        <p className="text-muted-foreground text-sm">Belum ada kuota yang diatur untuk gelombang ini.</p>
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
                        <h2 className="text-muted-foreground text-sm font-medium">
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

                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
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
                                        <TableCell colSpan={8}>
                                            <EmptyState title="Tidak ada pendaftar." />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {filteredPendaftaran.map((p, index) => (
                                    <TableRow key={p.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{p.nomor_pendaftaran}</TableCell>
                                        <TableCell>{p.nama_pendaftar}</TableCell>
                                        <TableCell>{p.user.name}</TableCell>
                                        <TableCell>
                                            {p.kategori_siswa ? (
                                                p.kategori_siswa.nama
                                            ) : (
                                                <span className="text-muted-foreground">Belum ditentukan</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusBadgeClass(p.status)}>
                                                {STATUS_LABEL[p.status]}
                                            </Badge>
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
        </>
    );
}

StafPpdbDashboard.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function SiswaPerluAktivasiRow({ siswa }: { siswa: SiswaPerluAktivasi }) {
    const form = useForm({});

    const cobaAktivasi = () => {
        form.post(route('staf.ppdb-dashboard.coba-aktivasi', siswa.id), { preserveScroll: true });
    };

    return (
        <li className="flex items-center justify-between gap-2">
            <span className="font-medium">{siswa.nama}</span>
            <Button variant="outline" size="sm" disabled={form.processing} onClick={cobaAktivasi}>
                Coba Aktivasi
            </Button>
        </li>
    );
}

function KuotaBarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: KuotaKategoriSummary }> }) {
    if (!active || !payload?.length) return null;

    const row = payload[0].payload;

    return (
        <div className="bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-sm shadow-md">
            <p className="font-medium">{row.kategori}</p>
            <p className="text-muted-foreground">
                Terpakai: <span className="text-foreground font-medium">{row.terpakai}</span>
            </p>
            <p className="text-muted-foreground">
                Sisa: <span className="text-foreground font-medium">{row.sisa}</span>
            </p>
        </div>
    );
}

function KuotaBarChart({ data }: { data: KuotaKategoriSummary[] }) {
    return (
        <div className="flex flex-col gap-3">
            <ResponsiveContainer width="100%" height={Math.max(160, data.length * 48)}>
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="kategori"
                        width={96}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    />
                    <Tooltip content={<KuotaBarTooltip />} cursor={{ fill: 'var(--accent)' }} />
                    <Bar dataKey="terpakai" stackId="kuota" fill="var(--chart-1)" radius={[4, 0, 0, 4]} barSize={20} isAnimationActive={false} />
                    <Bar dataKey="sisa" stackId="kuota" fill="var(--chart-5)" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false} />
                </BarChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--chart-1)' }} />
                    Terpakai
                </span>
                <span className="flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--chart-5)' }} />
                    Sisa
                </span>
            </div>
        </div>
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
                    <Badge variant="outline" className={statusBadgeClass(penuh ? 'penuh' : 'tersedia')}>
                        {penuh ? 'Penuh' : 'Tersedia'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-semibold">
                    {terpakai} <span className="text-muted-foreground text-sm font-normal">/ {total}</span>
                </p>
                <div className="bg-muted mt-2 h-2 w-full overflow-hidden rounded-full">
                    <div
                        className={cn('h-full rounded-full transition-all', penuh ? 'bg-destructive' : 'bg-primary')}
                        style={{ width: `${persentase}%` }}
                    />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">Sisa: {sisa}</p>
            </CardContent>
        </Card>
    );
}
