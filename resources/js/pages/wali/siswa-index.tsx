import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { statusBadgeClass } from '@/lib/status-badge';
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

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Anak Saya', href: '/wali/siswa' }];

export default function WaliSiswaIndex({ siswa }: { siswa: SiswaRow[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Anak Saya" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Anak Saya" description="Daftar anak yang terhubung dengan akun Anda." />

                {siswa.length === 0 ? (
                    <Card>
                        <CardContent>
                            <EmptyState
                                title="Belum ada anak terdaftar."
                                description="Daftar PPDB dulu untuk mulai."
                                action={{ label: 'Daftar PPDB', href: route('ppdb.create') }}
                            />
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
                                            <Badge variant="outline" className={statusBadgeClass(s.status)}>
                                                {STATUS_LABEL[s.status]}
                                            </Badge>
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
