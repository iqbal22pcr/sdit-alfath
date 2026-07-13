import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah, formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface TahunAjaranOption {
    id: number;
    nama: string;
}

interface GelombangPpdb {
    id: number;
    tahun_ajaran_id: number;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    biaya_masuk: number;
    status_buka: boolean;
    tahun_ajaran: TahunAjaranOption;
}

interface GelombangPpdbForm {
    tahun_ajaran_id: string;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    biaya_masuk: number | string;
    status_buka: boolean;
    [key: string]: string | number | boolean;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Gelombang PPDB', href: '/gelombang-ppdb' }];

const emptyForm: GelombangPpdbForm = {
    tahun_ajaran_id: '',
    nama: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    biaya_masuk: 0,
    status_buka: false,
};

const toDateInput = (value: string) => value.slice(0, 10);

export default function GelombangPpdbIndex({ gelombangPpdb, tahunAjaran }: { gelombangPpdb: GelombangPpdb[]; tahunAjaran: TahunAjaranOption[] }) {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<GelombangPpdb | null>(null);
    const [deleting, setDeleting] = useState<GelombangPpdb | null>(null);

    const addForm = useForm<GelombangPpdbForm>(emptyForm);
    const editForm = useForm<GelombangPpdbForm>(emptyForm);
    const deleteForm = useForm({});

    const submitAdd: FormEventHandler = (e) => {
        e.preventDefault();

        addForm.post(route('gelombang-ppdb.store'), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    };

    const openEdit = (gelombang: GelombangPpdb) => {
        editForm.clearErrors();
        editForm.setData({
            tahun_ajaran_id: String(gelombang.tahun_ajaran_id),
            nama: gelombang.nama,
            tanggal_mulai: toDateInput(gelombang.tanggal_mulai),
            tanggal_selesai: toDateInput(gelombang.tanggal_selesai),
            biaya_masuk: gelombang.biaya_masuk,
            status_buka: gelombang.status_buka,
        });
        setEditing(gelombang);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!editing) return;

        editForm.put(route('gelombang-ppdb.update', editing.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const confirmDelete = () => {
        if (!deleting) return;

        deleteForm.delete(route('gelombang-ppdb.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Gelombang PPDB" />

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    <Heading
                        title="Gelombang PPDB"
                        description="Kelola gelombang penerimaan siswa baru beserta kuota tiap kategori."
                        withSidebarTrigger
                    />

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
                                <Button>Tambah Gelombang</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tambah Gelombang PPDB</DialogTitle>
                                    <DialogDescription>Buat gelombang penerimaan siswa baru.</DialogDescription>
                                </DialogHeader>

                                <form className="space-y-4" onSubmit={submitAdd}>
                                    <GelombangFields form={addForm} tahunAjaran={tahunAjaran} idPrefix="add" />

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

                <Card className="rounded-xl">
                    <CardContent className="p-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Tahun Ajaran</TableHead>
                                    <TableHead>Periode</TableHead>
                                    <TableHead>Biaya Masuk</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gelombangPpdb.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <EmptyState
                                                title="Belum ada gelombang PPDB."
                                                action={{ label: 'Tambah Gelombang', onClick: () => setAddOpen(true) }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {gelombangPpdb.map((gelombang, index) => (
                                    <TableRow key={gelombang.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell className="font-medium">{gelombang.nama}</TableCell>
                                        <TableCell>{gelombang.tahun_ajaran.nama}</TableCell>
                                        <TableCell>
                                            {formatTanggal(gelombang.tanggal_mulai)} s/d {formatTanggal(gelombang.tanggal_selesai)}
                                        </TableCell>
                                        <TableCell>{formatRupiah(gelombang.biaya_masuk)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusBadgeClass(gelombang.status_buka ? 'buka' : 'tutup')}>
                                                {gelombang.status_buka ? 'Buka' : 'Tutup'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('gelombang-ppdb.show', gelombang.id)}>Kelola Kuota</Link>
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => openEdit(gelombang)}>
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleting(gelombang)}>
                                                    Hapus
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Edit dialog */}
            <Dialog
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditing(null);
                        editForm.clearErrors();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Gelombang PPDB</DialogTitle>
                        <DialogDescription>Perbarui data gelombang &quot;{editing?.nama}&quot;.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={submitEdit}>
                        <GelombangFields form={editForm} tahunAjaran={tahunAjaran} idPrefix="edit" />

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={editForm.processing}>
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Gelombang PPDB</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus gelombang &quot;{deleting?.nama}&quot;? Kuota kategori yang terkait juga akan terhapus.
                            Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="button" variant="destructive" disabled={deleteForm.processing} onClick={confirmDelete}>
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

GelombangPpdbIndex.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function GelombangFields({
    form,
    tahunAjaran,
    idPrefix,
}: {
    form: ReturnType<typeof useForm<GelombangPpdbForm>>;
    tahunAjaran: TahunAjaranOption[];
    idPrefix: string;
}) {
    return (
        <>
            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-tahun-ajaran`}>Tahun Ajaran</Label>
                <Select value={form.data.tahun_ajaran_id} onValueChange={(value) => form.setData('tahun_ajaran_id', value)}>
                    <SelectTrigger id={`${idPrefix}-tahun-ajaran`}>
                        <SelectValue placeholder="Pilih tahun ajaran" />
                    </SelectTrigger>
                    <SelectContent>
                        {tahunAjaran.map((tahun) => (
                            <SelectItem key={tahun.id} value={String(tahun.id)}>
                                {tahun.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={form.errors.tahun_ajaran_id} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-nama`}>Nama</Label>
                <Input
                    id={`${idPrefix}-nama`}
                    value={form.data.nama}
                    onChange={(e) => form.setData('nama', e.target.value)}
                    placeholder="mis. Gelombang 1"
                />
                <InputError message={form.errors.nama} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-tanggal-mulai`}>Tanggal Mulai</Label>
                    <Input
                        id={`${idPrefix}-tanggal-mulai`}
                        type="date"
                        value={form.data.tanggal_mulai}
                        onChange={(e) => form.setData('tanggal_mulai', e.target.value)}
                    />
                    <InputError message={form.errors.tanggal_mulai} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-tanggal-selesai`}>Tanggal Selesai</Label>
                    <Input
                        id={`${idPrefix}-tanggal-selesai`}
                        type="date"
                        value={form.data.tanggal_selesai}
                        onChange={(e) => form.setData('tanggal_selesai', e.target.value)}
                    />
                    <InputError message={form.errors.tanggal_selesai} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-biaya-masuk`}>Biaya Masuk (Rp)</Label>
                <Input
                    id={`${idPrefix}-biaya-masuk`}
                    type="number"
                    min={0}
                    value={form.data.biaya_masuk}
                    onChange={(e) => form.setData('biaya_masuk', e.target.value)}
                />
                <InputError message={form.errors.biaya_masuk} />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id={`${idPrefix}-status-buka`}
                    checked={form.data.status_buka}
                    onCheckedChange={(checked) => form.setData('status_buka', checked === true)}
                />
                <Label htmlFor={`${idPrefix}-status-buka`}>Buka pendaftaran untuk gelombang ini</Label>
                <InputError message={form.errors.status_buka} />
            </div>
        </>
    );
}
