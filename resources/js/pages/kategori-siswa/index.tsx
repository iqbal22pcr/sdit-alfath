import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface KategoriSiswa {
    id: number;
    nama: string;
    persentase_diskon: number;
    deskripsi: string | null;
}

interface KategoriSiswaForm {
    nama: string;
    persentase_diskon: number | string;
    deskripsi: string;
    [key: string]: string | number;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kategori Siswa', href: '/kategori-siswa' }];

const emptyForm: KategoriSiswaForm = { nama: '', persentase_diskon: 0, deskripsi: '' };

export default function KategoriSiswaIndex({ kategoriSiswa }: { kategoriSiswa: KategoriSiswa[] }) {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<KategoriSiswa | null>(null);
    const [deleting, setDeleting] = useState<KategoriSiswa | null>(null);

    const addForm = useForm<KategoriSiswaForm>(emptyForm);
    const editForm = useForm<KategoriSiswaForm>(emptyForm);
    const deleteForm = useForm({});

    const submitAdd: FormEventHandler = (e) => {
        e.preventDefault();

        addForm.post(route('kategori-siswa.store'), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    };

    const openEdit = (kategori: KategoriSiswa) => {
        editForm.clearErrors();
        editForm.setData({
            nama: kategori.nama,
            persentase_diskon: kategori.persentase_diskon,
            deskripsi: kategori.deskripsi ?? '',
        });
        setEditing(kategori);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!editing) return;

        editForm.put(route('kategori-siswa.update', editing.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const confirmDelete = () => {
        if (!deleting) return;

        deleteForm.delete(route('kategori-siswa.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori Siswa" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Kategori Siswa" description="Kelola kategori siswa beserta persentase potongan biaya untuk tiap kategori." />

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
                            <Button>Tambah Kategori</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Kategori Siswa</DialogTitle>
                                <DialogDescription>Buat kategori/golongan siswa baru beserta persentase potongan biaya.</DialogDescription>
                            </DialogHeader>

                            <form className="space-y-4" onSubmit={submitAdd}>
                                <div className="grid gap-2">
                                    <Label htmlFor="add-nama">Nama</Label>
                                    <Input
                                        id="add-nama"
                                        value={addForm.data.nama}
                                        onChange={(e) => addForm.setData('nama', e.target.value)}
                                        placeholder="mis. Reguler"
                                    />
                                    <InputError message={addForm.errors.nama} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="add-persentase">Persentase Diskon (%)</Label>
                                    <Input
                                        id="add-persentase"
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={addForm.data.persentase_diskon}
                                        onChange={(e) => addForm.setData('persentase_diskon', e.target.value)}
                                    />
                                    <InputError message={addForm.errors.persentase_diskon} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="add-deskripsi">Deskripsi</Label>
                                    <Textarea
                                        id="add-deskripsi"
                                        value={addForm.data.deskripsi}
                                        onChange={(e) => addForm.setData('deskripsi', e.target.value)}
                                        placeholder="Penjelasan singkat kategori (opsional)"
                                    />
                                    <InputError message={addForm.errors.deskripsi} />
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

                <Card className="rounded-xl">
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Persentase Diskon</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {kategoriSiswa.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <EmptyState
                                                title="Belum ada kategori siswa."
                                                action={{ label: 'Tambah Kategori', onClick: () => setAddOpen(true) }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}

                                {kategoriSiswa.map((kategori) => (
                                    <TableRow key={kategori.id}>
                                        <TableCell className="font-medium">{kategori.nama}</TableCell>
                                        <TableCell>{kategori.persentase_diskon}%</TableCell>
                                        <TableCell className="max-w-md text-muted-foreground">{kategori.deskripsi}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => openEdit(kategori)}>
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleting(kategori)}>
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
                        <DialogTitle>Edit Kategori Siswa</DialogTitle>
                        <DialogDescription>Perbarui data kategori &quot;{editing?.nama}&quot;.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={submitEdit}>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-nama">Nama</Label>
                            <Input id="edit-nama" value={editForm.data.nama} onChange={(e) => editForm.setData('nama', e.target.value)} />
                            <InputError message={editForm.errors.nama} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-persentase">Persentase Diskon (%)</Label>
                            <Input
                                id="edit-persentase"
                                type="number"
                                min={0}
                                max={100}
                                value={editForm.data.persentase_diskon}
                                onChange={(e) => editForm.setData('persentase_diskon', e.target.value)}
                            />
                            <InputError message={editForm.errors.persentase_diskon} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-deskripsi">Deskripsi</Label>
                            <Textarea
                                id="edit-deskripsi"
                                value={editForm.data.deskripsi}
                                onChange={(e) => editForm.setData('deskripsi', e.target.value)}
                            />
                            <InputError message={editForm.errors.deskripsi} />
                        </div>

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
                        <DialogTitle>Hapus Kategori Siswa</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus kategori &quot;{deleting?.nama}&quot;? Tindakan ini tidak dapat dibatalkan.
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
        </AppLayout>
    );
}
