import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pendaftaran PPDB', href: '/ppdb/daftar' }];

export default function PpdbBelumDibuka() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="PPDB Belum Dibuka" />

            <div className="mx-auto max-w-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>PPDB Belum Dibuka</CardTitle>
                        <CardDescription>
                            Saat ini tidak ada gelombang pendaftaran yang sedang berlangsung. Silakan cek kembali nanti atau hubungi pihak
                            sekolah untuk informasi jadwal PPDB berikutnya.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </AppLayout>
    );
}
