import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface SiswaRow {
    id: number;
    nama: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Akademik', href: '/wali/akademik' }];

export default function WaliAkademik({ siswa }: { siswa: SiswaRow[] }) {
    const getInitials = useInitials();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Akademik" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Akademik" description="Pilih anak untuk melihat informasi akademiknya." />

                {siswa.length === 0 ? (
                    <Card className="rounded-xl">
                        <CardContent>
                            <EmptyState
                                title="Belum ada anak yang aktif."
                                description="Informasi akademik baru tersedia setelah anak Anda berstatus aktif sebagai siswa."
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {siswa.map((s) => (
                            <Link key={s.id} href={route('wali.akademik.show', s.id)}>
                                <Card className="rounded-xl transition-colors hover:bg-accent">
                                    <CardContent className="flex items-center gap-3 py-4">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(s.nama)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{s.nama}</span>
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
