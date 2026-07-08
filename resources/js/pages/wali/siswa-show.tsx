import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type StatusSiswa = 'calon' | 'aktif' | 'alumni' | 'keluar';
type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';
type Metode = 'tunai' | 'transfer';

interface TagihanRow {
    id: number;
    nomor_tagihan: string;
    nominal: number;
    terbayar: number;
    status: StatusTagihan;
    komponen_biaya: { nama: string; jenis: string };
}

interface PembayaranRow {
    id: number;
    nomor_pembayaran: string;
    nominal: number;
    tanggal_bayar: string;
    metode: Metode;
    tagihan: { nomor_tagihan: string };
}

interface SiswaDetail {
    id: number;
    nama: string;
    nis: string;
    status: StatusSiswa;
    kategori_siswa: { nama: string } | null;
    tagihan: TagihanRow[];
}

const STATUS_SISWA_LABEL: Record<StatusSiswa, string> = {
    calon: 'Calon Siswa',
    aktif: 'Aktif',
    alumni: 'Alumni',
    keluar: 'Keluar',
};

const STATUS_SISWA_BADGE_VARIANT: Record<StatusSiswa, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    calon: 'outline',
    aktif: 'default',
    alumni: 'secondary',
    keluar: 'destructive',
};

const STATUS_TAGIHAN_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const STATUS_TAGIHAN_BADGE_VARIANT: Record<StatusTagihan, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    belum_bayar: 'secondary',
    sebagian: 'outline',
    lunas: 'default',
};

const METODE_LABEL: Record<Metode, string> = {
    tunai: 'Tunai',
    transfer: 'Transfer',
};

const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const formatTanggal = (value: string) =>
    new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default function WaliSiswaShow({ siswa, pembayaran }: { siswa: SiswaDetail; pembayaran: PembayaranRow[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Anak Saya', href: '/wali/siswa' },
        { title: siswa.nama, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={siswa.nama} />

            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">{siswa.nama}</h1>
                        <p className="text-sm text-muted-foreground">
                            NIS: {siswa.nis} · Kategori: {siswa.kategori_siswa ? siswa.kategori_siswa.nama : '-'}
                        </p>
                    </div>
                    <Badge variant={STATUS_SISWA_BADGE_VARIANT[siswa.status]}>{STATUS_SISWA_LABEL[siswa.status]}</Badge>
                </div>

                <div className="flex flex-col gap-4">
                    <h2 className="text-sm font-medium text-muted-foreground">Tagihan</h2>

                    {siswa.tagihan.length === 0 && (
                        <Card>
                            <CardContent className="py-6 text-center text-sm text-muted-foreground">Belum ada tagihan.</CardContent>
                        </Card>
                    )}

                    {siswa.tagihan.map((t) => (
                        <Card key={t.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <CardTitle className="text-base">{t.nomor_tagihan}</CardTitle>
                                    <Badge variant={STATUS_TAGIHAN_BADGE_VARIANT[t.status]}>{STATUS_TAGIHAN_LABEL[t.status]}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                                    <Field label="Komponen Biaya" value={t.komponen_biaya.nama} />
                                    <Field label="Nominal" value={currency(t.nominal)} />
                                    <Field label="Terbayar" value={currency(t.terbayar)} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-medium text-muted-foreground">Riwayat Pembayaran</h2>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nomor Pembayaran</TableHead>
                                    <TableHead>Tagihan</TableHead>
                                    <TableHead>Nominal</TableHead>
                                    <TableHead>Tanggal Bayar</TableHead>
                                    <TableHead>Metode</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pembayaran.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                                            Belum ada riwayat pembayaran.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {pembayaran.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.nomor_pembayaran}</TableCell>
                                        <TableCell>{p.tagihan.nomor_tagihan}</TableCell>
                                        <TableCell>{currency(p.nominal)}</TableCell>
                                        <TableCell>{formatTanggal(p.tanggal_bayar)}</TableCell>
                                        <TableCell>{METODE_LABEL[p.metode]}</TableCell>
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

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p>{value}</p>
        </div>
    );
}
