import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/lib/format';
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

export default function GelombangPpdbShow({
    gelombangPpdb,
    kategoriDenganKuota,
}: {
    gelombangPpdb: GelombangPpdbDetail;
    kategoriDenganKuota: KategoriDenganKuota[];
}) {
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
        <>
            <Head title={`Kelola Kuota - ${gelombangPpdb.nama}`} />

            <form onSubmit={submit} className="flex flex-col gap-4 p-4">
                <div>
                    <Link href={route('gelombang-ppdb.index')} className="text-sm text-muted-foreground hover:underline">
                        &larr; Kembali ke daftar gelombang
                    </Link>
                    <div className="mt-2">
                        <Heading
                            title={gelombangPpdb.nama}
                            description={`${gelombangPpdb.tahun_ajaran.nama} · ${formatTanggal(gelombangPpdb.tanggal_mulai)} s/d ${formatTanggal(gelombangPpdb.tanggal_selesai)}`}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-md border">
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
                                    <TableCell colSpan={3}>
                                        <EmptyState
                                            title="Belum ada kategori siswa."
                                            description="Tambahkan kategori siswa dulu sebelum mengatur kuota gelombang ini."
                                            action={{ label: 'Kelola Kategori Siswa', href: route('kategori-siswa.index') }}
                                        />
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
        </>
    );
}

GelombangPpdbShow.layout = (page: React.ReactElement<{ gelombangPpdb: GelombangPpdbDetail }>) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gelombang PPDB', href: '/gelombang-ppdb' },
        { title: page.props.gelombangPpdb.nama, href: `/gelombang-ppdb/${page.props.gelombangPpdb.id}` },
    ];

    return <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
};
