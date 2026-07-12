import { DonutChart } from '@/components/charts/donut-chart';
import { HorizontalBarChart, type BarDatum } from '@/components/charts/horizontal-bar-chart';
import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatRupiahSingkat } from '@/lib/format';
import { statusBadgeClass, statusChartColor } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { type FormDataConvertible } from '@inertiajs/core';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';
type MetodeTerisi = 'tunai' | 'transfer';
type Metode = MetodeTerisi | '';
type JenisKomponen = 'masuk' | 'buku' | 'seragam' | 'spp';

interface TagihanRow {
    id: number;
    nomor_tagihan: string;
    nominal: number;
    terbayar: number;
    status: StatusTagihan;
    created_at: string;
    siswa: { nama: string };
    komponen_biaya: { nama: string; jenis: string };
}

interface BayarLangsungForm {
    nominal: string;
    tanggal_bayar: string;
    metode: Metode;
    bukti_transfer: File | null;
    [key: string]: FormDataConvertible;
}

interface BreakdownRow<T extends string> {
    name: T;
    value: number;
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const JENIS_LABEL: Record<JenisKomponen, string> = {
    masuk: 'Uang Masuk',
    buku: 'Uang Buku',
    seragam: 'Uang Seragam',
    spp: 'SPP Bulanan',
};

const JENIS_CHART_COLOR: Record<JenisKomponen, string> = {
    masuk: 'var(--chart-1)',
    buku: 'var(--chart-2)',
    seragam: 'var(--chart-3)',
    spp: 'var(--chart-4)',
};

const todayInput = () => new Date().toISOString().slice(0, 10);

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kelola Tagihan', href: '/staf/tagihan' }];

export default function StafTagihanIndex({
    tagihan,
    statusBreakdown,
    nominalPerJenis,
}: {
    tagihan: TagihanRow[];
    statusBreakdown: BreakdownRow<StatusTagihan>[];
    nominalPerJenis: BreakdownRow<JenisKomponen>[];
}) {
    const [statusFilter, setStatusFilter] = useState<StatusTagihan | 'semua'>('semua');
    const [paying, setPaying] = useState<TagihanRow | null>(null);

    const filteredTagihan = useMemo(
        () => (statusFilter === 'semua' ? tagihan : tagihan.filter((t) => t.status === statusFilter)),
        [tagihan, statusFilter],
    );

    const bayarForm = useForm<BayarLangsungForm>({
        nominal: '',
        tanggal_bayar: todayInput(),
        metode: '',
        bukti_transfer: null,
    });

    const sisa = paying ? paying.nominal - paying.terbayar : 0;
    const wajibLunasSekaligus = paying !== null && paying.komponen_biaya.jenis !== 'masuk';

    const openBayar = (row: TagihanRow) => {
        bayarForm.clearErrors();
        bayarForm.setData({
            nominal: row.komponen_biaya.jenis !== 'masuk' ? String(row.nominal - row.terbayar) : '',
            tanggal_bayar: todayInput(),
            metode: '',
            bukti_transfer: null,
        });
        setPaying(row);
    };

    const closeBayar = () => {
        setPaying(null);
        bayarForm.reset();
        bayarForm.clearErrors();
    };

    const submitBayar: FormEventHandler = (e) => {
        e.preventDefault();

        if (!paying) return;

        bayarForm.post(route('staf.tagihan.bayar-langsung.store', paying.id), {
            preserveScroll: true,
            onSuccess: () => {
                bayarForm.reset();
                setPaying(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Tagihan" />

            <div className="flex flex-col gap-6 p-4">
                <Heading title="Kelola Tagihan" description="Kelola tagihan pembayaran siswa dan pantau status pelunasannya." />

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card className="rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base">Breakdown Status Tagihan</CardTitle>
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
                            <CardTitle className="text-base">Total Nominal per Jenis Komponen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <HorizontalBarChart
                                data={nominalPerJenis.map(
                                    (row): BarDatum => ({
                                        key: row.name,
                                        label: JENIS_LABEL[row.name],
                                        value: row.value,
                                        color: JENIS_CHART_COLOR[row.name],
                                    }),
                                )}
                                valueFormatter={formatRupiah}
                                labelFormatter={formatRupiahSingkat}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-end">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusTagihan | 'semua')}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="semua">Semua Status</SelectItem>
                            {(Object.keys(STATUS_LABEL) as StatusTagihan[]).map((status) => (
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
                                <TableHead>Nomor Tagihan</TableHead>
                                <TableHead>Nama Siswa</TableHead>
                                <TableHead>Komponen Biaya</TableHead>
                                <TableHead>Nominal</TableHead>
                                <TableHead>Terbayar</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTagihan.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <EmptyState title="Belum ada tagihan." />
                                    </TableCell>
                                </TableRow>
                            )}

                            {filteredTagihan.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">{t.nomor_tagihan}</TableCell>
                                    <TableCell>{t.siswa.nama}</TableCell>
                                    <TableCell>{t.komponen_biaya.nama}</TableCell>
                                    <TableCell>{formatRupiah(t.nominal)}</TableCell>
                                    <TableCell>{formatRupiah(t.terbayar)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={statusBadgeClass(t.status)}>
                                            {STATUS_LABEL[t.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('staf.tagihan.show', t.id)}>Detail</Link>
                                            </Button>
                                            {t.status !== 'lunas' && (
                                                <Button size="sm" onClick={() => openBayar(t)}>
                                                    Bayar
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={paying !== null} onOpenChange={(open) => !open && closeBayar()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bayar Tagihan</DialogTitle>
                        <DialogDescription>
                            {paying?.nomor_tagihan} &mdash; {paying?.siswa.nama}
                        </DialogDescription>
                    </DialogHeader>

                    {paying && (
                        <form className="flex flex-col gap-4" onSubmit={submitBayar}>
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
                                    <SelectTrigger id="metode" className="w-full">
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
                                    />
                                    <InputError message={bayarForm.errors.bukti_transfer} />
                                </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={bayarForm.processing}>
                                    Catat Pembayaran
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
