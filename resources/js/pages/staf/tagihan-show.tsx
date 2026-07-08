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
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

type StatusTagihan = 'belum_bayar' | 'sebagian' | 'lunas';
type StatusItemCicilan = 'belum_bayar' | 'lunas';
type Metode = 'tunai' | 'transfer' | '';

interface ItemCicilan {
    id: number;
    cicilan_ke: number;
    jatuh_tempo: string;
    nominal: number;
    status: StatusItemCicilan;
}

interface RencanaCicilan {
    id: number;
    jumlah_cicilan: number;
    item_cicilan: ItemCicilan[];
}

interface TagihanDetail {
    id: number;
    nomor_tagihan: string;
    bulan_tagihan: number | null;
    tahun_tagihan: number;
    nominal: number;
    terbayar: number;
    status: StatusTagihan;
    siswa: { id: number; nama: string; nis: string };
    komponen_biaya: { id: number; nama: string; jenis: string };
    rencana_cicilan: RencanaCicilan | null;
}

interface AturCicilanForm {
    jumlah_cicilan: string;
    [key: string]: string;
}

interface BayarLangsungForm {
    nominal: string;
    tanggal_bayar: string;
    metode: Metode;
    [key: string]: string;
}

interface BayarCicilanForm {
    nominal: string;
    tanggal_bayar: string;
    metode: Metode;
    [key: string]: string;
}

const STATUS_LABEL: Record<StatusTagihan, string> = {
    belum_bayar: 'Belum Bayar',
    sebagian: 'Sebagian',
    lunas: 'Lunas',
};

const STATUS_BADGE_VARIANT: Record<StatusTagihan, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    belum_bayar: 'secondary',
    sebagian: 'outline',
    lunas: 'default',
};

const ITEM_STATUS_LABEL: Record<StatusItemCicilan, string> = {
    belum_bayar: 'Belum Bayar',
    lunas: 'Lunas',
};

const ITEM_STATUS_BADGE_VARIANT: Record<StatusItemCicilan, 'default' | 'secondary'> = {
    belum_bayar: 'secondary',
    lunas: 'default',
};

const currency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

const formatTanggal = (value: string) =>
    new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

const todayInput = () => new Date().toISOString().slice(0, 10);

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kelola Tagihan', href: '/staf/tagihan' },
    { title: 'Detail Tagihan', href: '#' },
];

export default function StafTagihanShow({ tagihan }: { tagihan: TagihanDetail }) {
    const form = useForm<AturCicilanForm>({ jumlah_cicilan: '3' });
    const bayarForm = useForm<BayarLangsungForm>({ nominal: '', tanggal_bayar: todayInput(), metode: '' });
    const cicilanBayarForm = useForm<BayarCicilanForm>({ nominal: '', tanggal_bayar: todayInput(), metode: '' });

    const [payingItem, setPayingItem] = useState<ItemCicilan | null>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('staf.tagihan.cicilan.store', tagihan.id), { preserveScroll: true });
    };

    const submitBayarLangsung: FormEventHandler = (e) => {
        e.preventDefault();
        bayarForm.post(route('staf.tagihan.bayar-langsung.store', tagihan.id), {
            preserveScroll: true,
            onSuccess: () => bayarForm.reset(),
        });
    };

    const openBayarCicilan = (item: ItemCicilan) => {
        cicilanBayarForm.clearErrors();
        cicilanBayarForm.setData({ nominal: String(item.nominal), tanggal_bayar: todayInput(), metode: '' });
        setPayingItem(item);
    };

    const submitBayarCicilan: FormEventHandler = (e) => {
        e.preventDefault();
        if (! payingItem) return;

        cicilanBayarForm.post(route('staf.item-cicilan.bayar.store', payingItem.id), {
            preserveScroll: true,
            onSuccess: () => setPayingItem(null),
        });
    };

    const bisaAturCicilan = tagihan.komponen_biaya.jenis === 'masuk' && ! tagihan.rencana_cicilan && tagihan.status !== 'lunas';
    const bisaBayarLangsung = ! tagihan.rencana_cicilan && tagihan.status !== 'lunas';
    const sisa = tagihan.nominal - tagihan.terbayar;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tagihan ${tagihan.nomor_tagihan}`} />

            <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">{tagihan.nomor_tagihan}</h1>
                        <p className="text-sm text-muted-foreground">
                            {tagihan.siswa.nama} ({tagihan.siswa.nis})
                        </p>
                    </div>
                    <Badge variant={STATUS_BADGE_VARIANT[tagihan.status]}>{STATUS_LABEL[tagihan.status]}</Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Tagihan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <Field label="Komponen Biaya" value={tagihan.komponen_biaya.nama} />
                        <Field label="Tahun Tagihan" value={String(tagihan.tahun_tagihan)} />
                        <Field label="Bulan Tagihan" value={tagihan.bulan_tagihan ? String(tagihan.bulan_tagihan) : '-'} />
                        <Field label="Nominal" value={currency(tagihan.nominal)} />
                        <Field label="Terbayar" value={currency(tagihan.terbayar)} />
                        <Field label="Sisa" value={currency(sisa)} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cicilan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tagihan.rencana_cicilan ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Cicilan Ke</TableHead>
                                            <TableHead>Jatuh Tempo</TableHead>
                                            <TableHead>Nominal</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tagihan.rencana_cicilan.item_cicilan
                                            .slice()
                                            .sort((a, b) => a.cicilan_ke - b.cicilan_ke)
                                            .map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.cicilan_ke}</TableCell>
                                                    <TableCell>{formatTanggal(item.jatuh_tempo)}</TableCell>
                                                    <TableCell>{currency(item.nominal)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={ITEM_STATUS_BADGE_VARIANT[item.status]}>
                                                            {ITEM_STATUS_LABEL[item.status]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {item.status === 'belum_bayar' && (
                                                            <Button variant="outline" size="sm" onClick={() => openBayarCicilan(item)}>
                                                                Bayar
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : bisaAturCicilan ? (
                            <form onSubmit={submit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="jumlah_cicilan">Jumlah Cicilan (2-12)</Label>
                                    <Input
                                        id="jumlah_cicilan"
                                        type="number"
                                        min={2}
                                        max={12}
                                        value={form.data.jumlah_cicilan}
                                        onChange={(e) => form.setData('jumlah_cicilan', e.target.value)}
                                        className="w-32"
                                    />
                                    <InputError message={form.errors.jumlah_cicilan} />
                                </div>
                                <div>
                                    <Button type="submit" disabled={form.processing}>
                                        Atur Cicilan
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <p className="text-sm text-muted-foreground">Tidak ada rencana cicilan untuk tagihan ini.</p>
                        )}
                    </CardContent>
                </Card>

                {bisaBayarLangsung && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bayar Tagihan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitBayarLangsung} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="nominal">Nominal (maks. {currency(sisa)})</Label>
                                    <Input
                                        id="nominal"
                                        type="number"
                                        min={1}
                                        max={sisa}
                                        value={bayarForm.data.nominal}
                                        onChange={(e) => bayarForm.setData('nominal', e.target.value)}
                                        className="w-48"
                                    />
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
                                    <Select value={bayarForm.data.metode} onValueChange={(value) => bayarForm.setData('metode', value as Metode)}>
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
                                <div>
                                    <Button type="submit" disabled={bayarForm.processing}>
                                        Catat Pembayaran
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Dialog
                open={payingItem !== null}
                onOpenChange={(open) => {
                    if (! open) {
                        setPayingItem(null);
                        cicilanBayarForm.clearErrors();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bayar Cicilan Ke-{payingItem?.cicilan_ke}</DialogTitle>
                        <DialogDescription>
                            Konfirmasi pembayaran cicilan sebesar {payingItem ? currency(payingItem.nominal) : ''}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitBayarCicilan} className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Nominal</Label>
                            <p className="text-sm font-medium">{payingItem ? currency(payingItem.nominal) : ''}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cicilan_tanggal_bayar">Tanggal Bayar</Label>
                            <Input
                                id="cicilan_tanggal_bayar"
                                type="date"
                                max={todayInput()}
                                value={cicilanBayarForm.data.tanggal_bayar}
                                onChange={(e) => cicilanBayarForm.setData('tanggal_bayar', e.target.value)}
                            />
                            <InputError message={cicilanBayarForm.errors.tanggal_bayar} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cicilan_metode">Metode</Label>
                            <Select
                                value={cicilanBayarForm.data.metode}
                                onValueChange={(value) => cicilanBayarForm.setData('metode', value as Metode)}
                            >
                                <SelectTrigger id="cicilan_metode">
                                    <SelectValue placeholder="Pilih metode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tunai">Tunai</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={cicilanBayarForm.errors.metode} />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={cicilanBayarForm.processing}>
                                Bayar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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
