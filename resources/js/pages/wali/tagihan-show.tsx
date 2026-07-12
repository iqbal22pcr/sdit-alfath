import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';
type Metode = 'tunai' | 'transfer';

interface PembayaranRow {
    id: number;
    nomor_pembayaran: string;
    nominal: number;
    tanggal_bayar: string;
    metode: Metode;
}

interface TagihanDetail {
    id: number;
    nomor_tagihan: string;
    bulan_tagihan: number | null;
    tahun_tagihan: number;
    jatuh_tempo: string | null;
    nominal: number;
    terbayar: number;
    status: StatusTagihan;
    siswa: { id: number; nama: string; nis: string };
    komponen_biaya: { id: number; nama: string; jenis: string };
    pembayaran: PembayaranRow[];
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const METODE_LABEL: Record<Metode, string> = {
    tunai: 'Tunai',
    transfer: 'Transfer',
};

export default function WaliTagihanShow({ tagihan }: { tagihan: TagihanDetail }) {
    const sisa = tagihan.nominal - tagihan.terbayar;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tagihan', href: '/wali/tagihan' },
        { title: tagihan.nomor_tagihan, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tagihan ${tagihan.nomor_tagihan}`} />

            <div className="flex w-full flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title={tagihan.nomor_tagihan} description={`${tagihan.siswa.nama} (${tagihan.siswa.nis})`} />
                    <Badge variant="outline" className={statusBadgeClass(tagihan.status)}>
                        {STATUS_LABEL[tagihan.status]}
                    </Badge>
                </div>

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>Detail Tagihan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
                        <Field label="Komponen Biaya" value={tagihan.komponen_biaya.nama} />
                        <Field label="Tahun Tagihan" value={String(tagihan.tahun_tagihan)} />
                        <Field label="Nominal" value={formatRupiah(tagihan.nominal)} />
                        <Field label="Terbayar" value={formatRupiah(tagihan.terbayar)} />
                        <Field label="Sisa" value={formatRupiah(sisa)} />
                        <Field label="Jatuh Tempo" value={tagihan.jatuh_tempo ? formatTanggal(tagihan.jatuh_tempo) : '-'} />
                    </CardContent>
                </Card>

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>Riwayat Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nomor Pembayaran</TableHead>
                                        <TableHead>Nominal</TableHead>
                                        <TableHead>Tanggal Bayar</TableHead>
                                        <TableHead>Metode</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tagihan.pembayaran.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <EmptyState title="Belum ada riwayat pembayaran." />
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {tagihan.pembayaran.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">{p.nomor_pembayaran}</TableCell>
                                            <TableCell>{formatRupiah(p.nominal)}</TableCell>
                                            <TableCell>{formatTanggal(p.tanggal_bayar)}</TableCell>
                                            <TableCell>{METODE_LABEL[p.metode]}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
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
