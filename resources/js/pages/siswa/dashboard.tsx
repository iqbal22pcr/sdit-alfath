import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard Akademik', href: '/siswa/dashboard' }];

export default function SiswaDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Akademik" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Dashboard Akademik" description="Ringkasan akademik untuk siswa." />

                <Card>
                    <CardContent className="py-10 text-center">
                        <p className="text-sm font-medium">Dashboard Akademik — Segera Hadir</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            Fitur nilai, jadwal, dan absensi akan tersedia di sini setelah modul akademik dibangun.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
