import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard Akademik', href: '/siswa/dashboard' }];

interface SiswaDashboardProps {
    siswa: { nama: string };
}

export default function SiswaDashboard({ siswa }: SiswaDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Akademik" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title={`Selamat datang, ${siswa.nama}`} description="Ringkasan akademik untuk siswa." />

                <Card>
                    <CardContent>
                        <EmptyState
                            title="Modul Akademik Sedang Dalam Pengembangan"
                            description="Modul Akademik (jadwal, absensi, nilai) sedang dalam pengembangan dan akan tersedia di sini."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
