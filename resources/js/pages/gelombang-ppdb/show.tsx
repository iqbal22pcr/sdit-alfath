import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type FormDataConvertible } from '@inertiajs/core';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface GelombangPpdbDetail {
    id: number;
    nama: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    biaya_masuk: number;
    status_buka: boolean;
    tahun_ajaran: { id: number; nama: string };
}

interface KategoriDenganKuota {
    kategori_siswa_id: number;
    nama: string;
    persentase_diskon: number;
    kuota: number | null;
}

interface KuotaBarisForm {
    kategori_siswa_id: number;
    kuota: number | string;
    [key: string]: FormDataConvertible;
}

interface KuotaBatchForm {
    kuota: KuotaBarisForm[];
    [key: string]: FormDataConvertible;
}

const toDateInput = (value: string) => value.slice(0, 10);

export default function GelombangPpdbShow({
    gelombangPpdb,
    kategoriDenganKuota,
}: {
    gelombangPpdb: GelombangPpdbDetail;
    kategoriDenganKuota: KategoriDenganKuota[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gelombang PPDB', href: '/gelombang-ppdb' },
        { title: gelombangPpdb.nama, href: `/gelombang-ppdb/${gelombangPpdb.id}` },
    ];

    const form = useForm<KuotaBatchForm>({
        kuota: kategoriDenganKuota.map((kategori) => ({
            kategori_siswa_id: kategori.kategori_siswa_id,
            kuota: kategori.kuota ?? 0,
        })),
    });

    const updateKuota = (index: number, value: string) => {
        form.setData(
            'kuota',
            form.data.kuota.map((baris, i) => (i === index ? { ...baris, kuota: value } : baris)),
        );
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('gelombang-ppdb.kuota.store', gelombangPpdb.id), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kelola Kuota - ${gelombangPpdb.nama}`} />

            <form onSubmit={submit} className="flex flex-col gap-4 p-4">
                <div>
                    <Link href={route('gelombang-ppdb.index')} className="text-sm text-muted-foreground hover:underline">
                        &larr; Kembali ke daftar gelombang
                    </Link>
                    <h1 className="mt-2 text-xl font-semibold">{gelombangPpdb.nama}</h1>
                    <p className="text-sm text-muted-foreground">
                        {gelombangPpdb.tahun_ajaran.nama} &middot; {toDateInput(gelombangPpdb.tanggal_mulai)} s/d{' '}
                        {toDateInput(gelombangPpdb.tanggal_selesai)}
                    </p>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Persentase Diskon</TableHead>
                                <TableHead>Kuota</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kategoriDenganKuota.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        Belum ada kategori siswa.
                                    </TableCell>
                                </TableRow>
                            )}

                            {kategoriDenganKuota.map((kategori, index) => (
                                <TableRow key={kategori.kategori_siswa_id}>
                                    <TableCell className="font-medium">{kategori.nama}</TableCell>
                                    <TableCell>{kategori.persentase_diskon}%</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min={0}
                                            className="w-28"
                                            value={form.data.kuota[index].kuota}
                                            onChange={(e) => updateKuota(index, e.target.value)}
                                        />
                                        <InputError message={form.errors[`kuota.${index}.kuota`]} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {kategoriDenganKuota.length > 0 && (
                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.processing}>
                            Simpan Semua Kuota
                        </Button>
                    </div>
                )}
            </form>
        </AppLayout>
    );
}
