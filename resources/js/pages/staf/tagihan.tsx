import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { SimplePagination } from '@/components/simple-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { type FormDataConvertible } from '@inertiajs/core';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

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
    komponen_biaya: { nama: string; jenis: JenisKomponen };
}

interface PaginatedTagihan {
    data: TagihanRow[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Filters {
    search: string;
    status: StatusTagihan | 'semua' | 'belum_lunas';
    jenis: JenisKomponen | 'semua';
    tahun_ajaran_id: string;
    overdue: boolean;
}

interface SiswaOption {
    id: number;
    nama: string;
}

interface TahunAjaranOption {
    id: number;
    nama: string;
}

interface KomponenBiayaOption {
    id: number;
    nama: string;
    jenis: JenisKomponen;
    nominal_dasar: number | null;
    berulang: boolean;
}

interface BuatTagihanForm {
    siswa_id: string;
    komponen_biaya_id: string;
    bulan_tagihan: string;
    tahun_tagihan: string;
    nominal: string;
    [key: string]: FormDataConvertible;
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

const JENIS_LABEL: Record<JenisKomponen, string> = {
    spp: 'SPP',
    masuk: 'Uang Masuk',
    buku: 'Uang Buku',
    seragam: 'Uang Seragam',
};

const BULAN_LABEL: Record<number, string> = {
    1: 'Januari',
    2: 'Februari',
    3: 'Maret',
    4: 'April',
    5: 'Mei',
    6: 'Juni',
    7: 'Juli',
    8: 'Agustus',
    9: 'September',
    10: 'Oktober',
    11: 'November',
    12: 'Desember',
};

const emptyBuatTagihanForm: BuatTagihanForm = {
    siswa_id: '',
    komponen_biaya_id: '',
    bulan_tagihan: '',
    tahun_tagihan: '',
    nominal: '',
};

const todayInput = () => new Date().toISOString().slice(0, 10);

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tagihan', href: '/staf/tagihan' }];

const SKELETON_ROWS = 8;

export default function StafTagihanIndex({
    tagihan,
    filters,
    siswaAktif,
    komponenBiaya,
    tahunAjaran,
}: {
    tagihan: PaginatedTagihan;
    filters: Filters;
    siswaAktif: SiswaOption[];
    komponenBiaya: KomponenBiayaOption[];
    tahunAjaran: TahunAjaranOption[];
}) {
    const [search, setSearch] = useState(filters.search);
    const [loading, setLoading] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [paying, setPaying] = useState<TagihanRow | null>(null);

    // router.on('start'/'finish') fires for every Inertia visit anywhere
    // in the app, including hover-triggered background prefetches (every
    // sidebar link uses `prefetch`). Without filtering, just moving the
    // mouse over a sidebar item while sitting on this page would flash
    // the skeleton over a table that isn't actually changing. Only
    // react to real (non-prefetch) visits targeting this page's own URL.
    useEffect(() => {
        const isOwnRealVisit = (visit: { prefetch: boolean; url: URL }) => !visit.prefetch && visit.url.pathname === window.location.pathname;

        const stopStart = router.on('start', (event) => {
            if (isOwnRealVisit(event.detail.visit)) setLoading(true);
        });
        const stopFinish = router.on('finish', (event) => {
            if (isOwnRealVisit(event.detail.visit)) setLoading(false);
        });

        return () => {
            stopStart();
            stopFinish();
        };
    }, []);

    // Debounced search -- fires 300ms after the user stops typing, and
    // only when the value actually differs from what's already been
    // sent to the server (skips the redundant round-trip right after a
    // server response updates `filters.search` to match).
    useEffect(() => {
        if (search === filters.search) return;

        const timeout = setTimeout(() => goToQuery({ search }), 300);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const goToQuery = (overrides: Partial<Filters>) => {
        router.get(
            route('staf.tagihan.index'),
            {
                search: overrides.search ?? filters.search,
                status: overrides.status ?? filters.status,
                jenis: overrides.jenis ?? filters.jenis,
                tahun_ajaran_id: overrides.tahun_ajaran_id ?? filters.tahun_ajaran_id,
                overdue: (overrides.overdue ?? filters.overdue) ? '1' : undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const addForm = useForm<BuatTagihanForm>(emptyBuatTagihanForm);

    const selectedKomponen = komponenBiaya.find((k) => String(k.id) === addForm.data.komponen_biaya_id) ?? null;
    const butuhBulanTahun = selectedKomponen?.berulang ?? false;

    const handleKomponenChange = (value: string) => {
        const komponen = komponenBiaya.find((k) => String(k.id) === value) ?? null;

        addForm.setData((data) => ({
            ...data,
            komponen_biaya_id: value,
            nominal: komponen?.nominal_dasar != null ? String(komponen.nominal_dasar) : '',
            bulan_tagihan: komponen?.berulang ? data.bulan_tagihan : '',
            tahun_tagihan: komponen?.berulang ? data.tahun_tagihan || String(new Date().getFullYear()) : '',
        }));
    };

    const submitAdd: FormEventHandler = (e) => {
        e.preventDefault();

        addForm.post(route('staf.tagihan.store'), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    };

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
        <>
            <Head title="Tagihan" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                    <Heading title="Tagihan" description="Kelola tagihan pembayaran siswa dan pantau status pelunasannya." withSidebarTrigger />

                    <div className="flex justify-end">
                        <Dialog
                            open={addOpen}
                            onOpenChange={(open) => {
                                setAddOpen(open);
                                if (!open) {
                                    addForm.reset();
                                    addForm.clearErrors();
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button>+ Buat Tagihan</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Buat Tagihan</DialogTitle>
                                    <DialogDescription>Buat tagihan baru untuk satu siswa.</DialogDescription>
                                </DialogHeader>

                                <form className="flex flex-col gap-4" onSubmit={submitAdd}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="siswa_id">Siswa</Label>
                                        <Select value={addForm.data.siswa_id} onValueChange={(value) => addForm.setData('siswa_id', value)}>
                                            <SelectTrigger id="siswa_id">
                                                <SelectValue placeholder="Pilih siswa" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {siswaAktif.map((s) => (
                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                        {s.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={addForm.errors.siswa_id} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="komponen_biaya_id">Komponen Biaya</Label>
                                        <Select value={addForm.data.komponen_biaya_id} onValueChange={handleKomponenChange}>
                                            <SelectTrigger id="komponen_biaya_id">
                                                <SelectValue placeholder="Pilih komponen biaya" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {komponenBiaya.map((k) => (
                                                    <SelectItem key={k.id} value={String(k.id)}>
                                                        {k.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={addForm.errors.komponen_biaya_id} />
                                    </div>

                                    {butuhBulanTahun && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="bulan_tagihan">Bulan Tagihan</Label>
                                                <Select
                                                    value={addForm.data.bulan_tagihan}
                                                    onValueChange={(value) => addForm.setData('bulan_tagihan', value)}
                                                >
                                                    <SelectTrigger id="bulan_tagihan">
                                                        <SelectValue placeholder="Pilih bulan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.entries(BULAN_LABEL).map(([value, label]) => (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={addForm.errors.bulan_tagihan} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="tahun_tagihan">Tahun Tagihan</Label>
                                                <Input
                                                    id="tahun_tagihan"
                                                    type="number"
                                                    value={addForm.data.tahun_tagihan}
                                                    onChange={(e) => addForm.setData('tahun_tagihan', e.target.value)}
                                                />
                                                <InputError message={addForm.errors.tahun_tagihan} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-2">
                                        <Label htmlFor="nominal">Nominal</Label>
                                        <Input
                                            id="nominal"
                                            type="number"
                                            min={1}
                                            value={addForm.data.nominal}
                                            onChange={(e) => addForm.setData('nominal', e.target.value)}
                                        />
                                        <InputError message={addForm.errors.nominal} />
                                    </div>

                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button type="button" variant="outline">
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={addForm.processing}>
                                            Simpan
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="overflow-hidden rounded-xl p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2 border-b pb-4">
                            <Input
                                placeholder="Cari nama siswa atau nomor tagihan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-72"
                            />

                            <Select value={filters.status} onValueChange={(value) => goToQuery({ status: value as Filters['status'] })}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Status</SelectItem>
                                    <SelectItem value="belum_lunas">Belum Lunas (semua)</SelectItem>
                                    {(Object.keys(STATUS_LABEL) as StatusTagihan[]).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {STATUS_LABEL[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.jenis} onValueChange={(value) => goToQuery({ jenis: value as Filters['jenis'] })}>
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Jenis komponen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Jenis</SelectItem>
                                    {(Object.keys(JENIS_LABEL) as JenisKomponen[]).map((jenis) => (
                                        <SelectItem key={jenis} value={jenis}>
                                            {JENIS_LABEL[jenis]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={filters.tahun_ajaran_id} onValueChange={(value) => goToQuery({ tahun_ajaran_id: value })}>
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Tahun Ajaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="semua">Semua Tahun Ajaran</SelectItem>
                                    {tahunAjaran.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted">
                                    <TableHead>No</TableHead>
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
                                {loading ? (
                                    Array.from({ length: SKELETON_ROWS }).map((_, index) => <SkeletonRow key={index} />)
                                ) : tagihan.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8}>
                                            <EmptyState title="Belum ada tagihan." />
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tagihan.data.map((t, index) => (
                                        <TableRow key={t.id}>
                                            <TableCell>{(tagihan.from ?? 1) + index}</TableCell>
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
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <div className="border-t pt-4">
                            <SimplePagination meta={tagihan} itemLabel="tagihan" />
                        </div>
                    </div>
                </Card>
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
        </>
    );
}

StafTagihanIndex.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function SkeletonRow() {
    return (
        <TableRow>
            <TableCell>
                <Skeleton className="h-4 w-6" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-28" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            <TableCell className="text-right">
                <Skeleton className="ml-auto h-8 w-32" />
            </TableCell>
        </TableRow>
    );
}
