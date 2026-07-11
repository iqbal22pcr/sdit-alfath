import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface SiswaBermasalah {
    id: number;
    nama: string;
    nis: string | null;
    kategori_siswa: { id: number; nama: string } | null;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Monitoring Aktivasi', href: '/staf/aktivasi-bermasalah' }];

export default function AktivasiBermasalah({ siswa }: { siswa: SiswaBermasalah[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitoring Aktivasi" />

            <div className="flex flex-col gap-4 p-4">
                <Heading
                    title="Monitoring Aktivasi"
                    description="Siswa yang seharusnya sudah aktif otomatis, tapi belum -- kondisi ini seharusnya tidak pernah terjadi dalam operasi normal."
                />

                {siswa.length === 0 ? (
                    <EmptyState title="Tidak ada masalah aktivasi saat ini." />
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {siswa.map((s) => (
                                    <SiswaBermasalahRow key={s.id} siswa={s} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function SiswaBermasalahRow({ siswa }: { siswa: SiswaBermasalah }) {
    const form = useForm({});

    const cobaLagi = () => {
        form.post(route('staf.aktivasi-bermasalah.coba-lagi', siswa.id), { preserveScroll: true });
    };

    return (
        <TableRow>
            <TableCell className="font-medium">{siswa.nama}</TableCell>
            <TableCell>{siswa.kategori_siswa?.nama ?? '-'}</TableCell>
            <TableCell className="text-right">
                <Button variant="outline" size="sm" disabled={form.processing} onClick={cobaLagi}>
                    Coba Aktivasi Lagi
                </Button>
            </TableCell>
        </TableRow>
    );
}
