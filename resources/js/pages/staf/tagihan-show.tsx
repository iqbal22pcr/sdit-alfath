import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { type FormDataConvertible } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';
type MetodeTerisi = 'tunai' | 'transfer';
type Metode = MetodeTerisi | '';

interface PembayaranRow {
    id: number;
    nomor_pembayaran: string;
    nominal: number;
    tanggal_bayar: string;
    metode: MetodeTerisi;
    bukti_transfer: string | null;
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

interface BayarLangsungForm {
    nominal: string;
    tanggal_bayar: string;
    metode: Metode;
    bukti_transfer: File | null;
    [key: string]: FormDataConvertible;
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const METODE_LABEL: Record<MetodeTerisi, string> = {
    tunai: 'Tunai',
    transfer: 'Transfer',
};

const todayInput = () => new Date().toISOString().slice(0, 10);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kelola Tagihan', href: '/staf/tagihan' },
    { title: 'Detail Tagihan', href: '#' },
];

export default function StafTagihanShow({ tagihan }: { tagihan: TagihanDetail }) {
    const sisa = tagihan.nominal - tagihan.terbayar;
    const jenisMasuk = tagihan.komponen_biaya.jenis === 'masuk';
    const wajibLunasSekaligus = ! jenisMasuk;

    const jatuhTempoTanggal = tagihan.jatuh_tempo ? tagihan.jatuh_tempo.slice(0, 10) : null;
    const terlambat = jenisMasuk && jatuhTempoTanggal !== null && tagihan.status !== 'lunas' && jatuhTempoTanggal < todayInput();

    const bayarForm = useForm<BayarLangsungForm>({
        nominal: wajibLunasSekaligus ? String(sisa) : '',
        tanggal_bayar: todayInput(),
        metode: '',
        bukti_transfer: null,
    });

    const submitBayarLangsung: FormEventHandler = (e) => {
        e.preventDefault();
        bayarForm.post(route('staf.tagihan.bayar-langsung.store', tagihan.id), {
            preserveScroll: true,
            onSuccess: () => bayarForm.reset(),
        });
    };

    const bisaBayar = tagihan.status !== 'lunas';

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
                        <Field label="Bulan Tagihan" value={tagihan.bulan_tagihan ? String(tagihan.bulan_tagihan) : '-'} />
                        <Field label="Nominal" value={formatRupiah(tagihan.nominal)} />
                        <Field label="Terbayar" value={formatRupiah(tagihan.terbayar)} />
                        <Field label="Sisa" value={formatRupiah(sisa)} />
                        {jenisMasuk && (
                            <div>
                                <p className="text-xs text-muted-foreground">Jatuh Tempo</p>
                                <div className="flex items-center gap-2">
                                    <p>{jatuhTempoTanggal ? formatTanggal(tagihan.jatuh_tempo as string) : '-'}</p>
                                    {terlambat && (
                                        <Badge variant="outline" className={statusBadgeClass('terlambat')}>
                                            Terlambat
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {bisaBayar ? (
                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle>Bayar Tagihan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitBayarLangsung} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nominal">
                                        {wajibLunasSekaligus ? 'Nominal (lunas sekaligus, tidak bisa sebagian)' : `Nominal (maks. ${formatRupiah(sisa)})`}
                                    </Label>
                                    {wajibLunasSekaligus ? (
                                        <p className="text-sm font-medium">{formatRupiah(sisa)}</p>
                                    ) : (
                                        <Input
                                            id="nominal"
                                            type="number"
                                            min={1}
                                            max={sisa}
                                            value={bayarForm.data.nominal}
                                            onChange={(e) => bayarForm.setData('nominal', e.target.value)}
                                            className="w-48"
                                        />
                                    )}
                                    <InputError message={bayarForm.errors.nominal} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_bayar">Tanggal Bayar</Label>
                                    <Input
                                        id="tanggal_bayar"
                                        type="date"
                                        max={todayInput()}
                                        value={bayarForm.data.tanggal_bayar}
                                        onChange={(e) => bayarForm.setData('tanggal_bayar', e.target.value)}
                                        className="w-48"
                                    />
                                    <InputError message={bayarForm.errors.tanggal_bayar} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="metode">Metode</Label>
                                    <Select
                                        value={bayarForm.data.metode}
                                        onValueChange={(value) => {
                                            bayarForm.setData('metode', value as Metode);
                                            if (value !== 'transfer') {
                                                bayarForm.setData('bukti_transfer', null);
                                            }
                                        }}
                                    >
                                        <SelectTrigger id="metode" className="w-48">
                                            <SelectValue placeholder="Pilih metode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tunai">Tunai</SelectItem>
                                            <SelectItem value="transfer">Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={bayarForm.errors.metode} />
                                </div>
                                {bayarForm.data.metode === 'transfer' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="bukti_transfer">Bukti Transfer</Label>
                                        <Input
                                            id="bukti_transfer"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => bayarForm.setData('bukti_transfer', e.target.files?.[0] ?? null)}
                                            className="w-64"
                                        />
                                        <InputError message={bayarForm.errors.bukti_transfer} />
                                    </div>
                                )}
                                <div>
                                    <Button type="submit" disabled={bayarForm.processing}>
                                        Catat Pembayaran
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <p className="text-sm text-muted-foreground">Tagihan ini sudah lunas.</p>
                )}

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
                                        <TableHead className="text-right">Bukti</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tagihan.pembayaran.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5}>
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
                                            <TableCell className="text-right">
                                                {p.metode === 'transfer' && p.bukti_transfer && (
                                                    <a
                                                        href={`/storage/${p.bukti_transfer}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary underline-offset-4 hover:underline"
                                                    >
                                                        Lihat Bukti
                                                    </a>
                                                )}
                                            </TableCell>
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

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
    return (
        <div className={className}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p>{value}</p>
        </div>
    );
}
