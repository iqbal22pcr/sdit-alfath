import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface TahunAjaran {
    id: number;
    nama: string;
    status_aktif: boolean;
}

interface TahunAjaranForm {
    nama: string;
    status_aktif: boolean;
    [key: string]: string | boolean;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tahun Ajaran', href: '/tahun-ajaran' }];

const emptyForm: TahunAjaranForm = { nama: '', status_aktif: false };

export default function TahunAjaranIndex({ tahunAjaran }: { tahunAjaran: TahunAjaran[] }) {
    const [addOpen, setAddOpen] = useState(false);
    const [editing, setEditing] = useState<TahunAjaran | null>(null);
    const [deleting, setDeleting] = useState<TahunAjaran | null>(null);

    const addForm = useForm<TahunAjaranForm>(emptyForm);
    const editForm = useForm<TahunAjaranForm>(emptyForm);
    const deleteForm = useForm({});

    const submitAdd: FormEventHandler = (e) => {
        e.preventDefault();

        addForm.post(route('tahun-ajaran.store'), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                setAddOpen(false);
            },
        });
    };

    const openEdit = (tahun: TahunAjaran) => {
        editForm.clearErrors();
        editForm.setData({
            nama: tahun.nama,
            status_aktif: tahun.status_aktif,
        });
        setEditing(tahun);
    };

    const submitEdit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!editing) return;

        editForm.put(route('tahun-ajaran.update', editing.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    };

    const confirmDelete = () => {
        if (!deleting) return;

        deleteForm.delete(route('tahun-ajaran.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tahun Ajaran" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Tahun Ajaran</h1>

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
                            <Button>Tambah Tahun Ajaran</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Tahun Ajaran</DialogTitle>
                                <DialogDescription>Buat tahun ajaran baru.</DialogDescription>
                            </DialogHeader>

                            <form className="space-y-4" onSubmit={submitAdd}>
                                <div className="grid gap-2">
                                    <Label htmlFor="add-nama">Nama</Label>
                                    <Input
                                        id="add-nama"
                                        value={addForm.data.nama}
                                        onChange={(e) => addForm.setData('nama', e.target.value)}
                                        placeholder="mis. 2026/2027"
                                    />
                                    <InputError message={addForm.errors.nama} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="add-status-aktif"
                                        checked={addForm.data.status_aktif}
                                        onCheckedChange={(checked) => addForm.setData('status_aktif', checked === true)}
                                    />
                                    <Label htmlFor="add-status-aktif">Jadikan tahun ajaran aktif</Label>
                                    <InputError message={addForm.errors.status_aktif} />
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">
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

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tahunAjaran.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        Belum ada tahun ajaran.
                                    </TableCell>
                                </TableRow>
                            )}

                            {tahunAjaran.map((tahun) => (
                                <TableRow key={tahun.id}>
                                    <TableCell className="font-medium">{tahun.nama}</TableCell>
                                    <TableCell>
                                        <Badge variant={tahun.status_aktif ? 'default' : 'secondary'}>
                                            {tahun.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEdit(tahun)}>
                                                Edit
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => setDeleting(tahun)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
                        <DialogTitle>Edit Tahun Ajaran</DialogTitle>
                        <DialogDescription>Perbarui data tahun ajaran &quot;{editing?.nama}&quot;.</DialogDescription>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={submitEdit}>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-nama">Nama</Label>
                            <Input id="edit-nama" value={editForm.data.nama} onChange={(e) => editForm.setData('nama', e.target.value)} />
                            <InputError message={editForm.errors.nama} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="edit-status-aktif"
                                checked={editForm.data.status_aktif}
                                onCheckedChange={(checked) => editForm.setData('status_aktif', checked === true)}
                            />
                            <Label htmlFor="edit-status-aktif">Jadikan tahun ajaran aktif</Label>
                            <InputError message={editForm.errors.status_aktif} />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
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
                        <DialogTitle>Hapus Tahun Ajaran</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus tahun ajaran &quot;{deleting?.nama}&quot;? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
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
