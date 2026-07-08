import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type StatusSiswa = 'calon' | 'aktif' | 'alumni' | 'keluar';

interface SiswaRow {
    id: number;
    nama: string;
    nis: string;
    status: StatusSiswa;
    kategori_siswa: { nama: string } | null;
}

const STATUS_LABEL: Record<StatusSiswa, string> = {
    calon: 'Calon Siswa',
    aktif: 'Aktif',
    alumni: 'Alumni',
    keluar: 'Keluar',
};

const STATUS_BADGE_VARIANT: Record<StatusSiswa, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    calon: 'outline',
    aktif: 'default',
    alumni: 'secondary',
    keluar: 'destructive',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Anak Saya', href: '/wali/siswa' }];

export default function WaliSiswaIndex({ siswa }: { siswa: SiswaRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Anak Saya" />

            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-xl font-semibold">Anak Saya</h1>

                {siswa.length === 0 ? (
                    <Card>
                        <CardContent className="py-6 text-center text-sm text-muted-foreground">
                            Belum ada data anak yang terhubung ke akun Anda.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {siswa.map((s) => (
                            <Link key={s.id} href={route('wali.siswa.show', s.id)} className="block">
                                <Card className="h-full transition hover:bg-accent/50">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <CardTitle className="text-base">{s.nama}</CardTitle>
                                            <Badge variant={STATUS_BADGE_VARIANT[s.status]}>{STATUS_LABEL[s.status]}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-1 text-sm text-muted-foreground">
                                        <p>NIS: {s.nis}</p>
                                        <p>Kategori: {s.kategori_siswa ? s.kategori_siswa.nama : '-'}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
