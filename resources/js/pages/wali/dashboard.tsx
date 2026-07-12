import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

type StatusSiswa = 'calon' | 'aktif' | 'alumni' | 'keluar';
type StatusPendaftaran = 'draft' | 'diajukan' | 'diverifikasi' | 'perlu_perbaikan' | 'diterima' | 'ditolak';

interface AlertJatuhTempo {
    namaAnak: string;
    jatuhTempo: string;
}

interface KontekProgresAktivasi {
    jenis: 'progres_aktivasi';
    terpenuhi: number;
    total: number;
}

interface KontekTunggakan {
    jenis: 'tunggakan';
    jumlah_tagihan: number;
    total_tunggakan: number;
}

interface Anak {
    nama: string;
    tipe: 'siswa' | 'pendaftaran';
    status: StatusSiswa | StatusPendaftaran;
    konteks: KontekProgresAktivasi | KontekTunggakan | null;
}

interface WaliDashboardProps {
    namaWali: string;
    jumlahAnak: number;
    jumlahTagihanBelumLunas: number;
    totalTunggakan: number;
    alertJatuhTempo: AlertJatuhTempo[];
    anak: Anak[];
}

const STATUS_SISWA_LABEL: Record<StatusSiswa, string> = {
    calon: 'Calon Siswa',
    aktif: 'Aktif',
    alumni: 'Alumni',
    keluar: 'Keluar',
};

const STATUS_PENDAFTARAN_LABEL: Record<StatusPendaftaran, string> = {
    draft: 'Draft',
    diajukan: 'Diajukan',
    diverifikasi: 'Diverifikasi',
    perlu_perbaikan: 'Perlu Perbaikan',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
};

function statusLabel(anak: Anak): string {
    return anak.tipe === 'siswa'
        ? STATUS_SISWA_LABEL[anak.status as StatusSiswa]
        : STATUS_PENDAFTARAN_LABEL[anak.status as StatusPendaftaran];
}

function sapaan(): string {
    const jam = new Date().getHours();

    if (jam < 11) return 'pagi';
    if (jam < 15) return 'siang';
    if (jam < 18) return 'sore';
    return 'malam';
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/wali/dashboard' }];

export default function WaliDashboard({ namaWali, jumlahAnak, jumlahTagihanBelumLunas, totalTunggakan, alertJatuhTempo, anak }: WaliDashboardProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6 p-4">
                <Heading
                    title={`Selamat ${sapaan()}, ${namaWali}`}
                    description={`${jumlahAnak} anak terdaftar.`}
                />

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
                            <Link href={route('wali.tagihan.index')} className="mt-2 inline-block font-medium underline underline-offset-4">
                                Lihat Tagihan
                            </Link>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="rounded-xl">
                        <CardContent className="pt-6">
                            <p className="text-[13px] text-muted-foreground">Total Anak</p>
                            <p className="mt-1 text-2xl font-medium">{jumlahAnak}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl">
                        <CardContent className="pt-6">
                            <p className="text-[13px] text-muted-foreground">Tagihan Belum Lunas</p>
                            <p className="mt-1 text-2xl font-medium">{jumlahTagihanBelumLunas}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-xl">
                        <CardContent className="pt-6">
                            <p className="text-[13px] text-muted-foreground">Total Tunggakan</p>
                            <p className="mt-1 text-2xl font-medium">{formatRupiah(totalTunggakan)}</p>
                        </CardContent>
                    </Card>
                </div>

                {anak.length === 0 ? (
                    <Card className="rounded-xl">
                        <CardContent>
                            <EmptyState
                                title="Belum ada anak terdaftar."
                                description="Daftarkan anak Anda untuk mulai."
                                action={{ label: 'Daftarkan Anak', href: route('ppdb.create') }}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {anak.map((a, index) => (
                            <Card key={index} className="rounded-xl">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="text-base">{a.nama}</CardTitle>
                                        <Badge variant="outline" className={statusBadgeClass(a.status)}>
                                            {statusLabel(a)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    {a.konteks?.jenis === 'progres_aktivasi' && (
                                        <p>
                                            Progres aktivasi: {a.konteks.terpenuhi} dari {a.konteks.total} syarat terpenuhi.
                                        </p>
                                    )}
                                    {a.konteks?.jenis === 'tunggakan' &&
                                        (a.konteks.jumlah_tagihan > 0 ? (
                                            <p>
                                                {a.konteks.jumlah_tagihan} tagihan belum lunas — total {formatRupiah(a.konteks.total_tunggakan)}.
                                            </p>
                                        ) : (
                                            <p>Semua tagihan lunas.</p>
                                        ))}
                                    {a.konteks === null && a.tipe === 'pendaftaran' && <p>Status verifikasi: {statusLabel(a)}.</p>}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    <Button asChild>
                        <Link href={route('ppdb.create')}>Daftarkan Anak</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={route('wali.tagihan.index')}>Lihat Semua Tagihan</Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
