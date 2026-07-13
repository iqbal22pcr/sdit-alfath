import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pendaftaran PPDB', href: '/ppdb/daftar' }];

export default function PpdbBelumDibuka() {
    return (
        <>
            <Head title="PPDB Belum Dibuka" />

            <div className="flex w-full flex-col gap-4 p-4">
                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>PPDB Belum Dibuka</CardTitle>
                        <CardDescription>
                            Saat ini tidak ada gelombang pendaftaran yang sedang berlangsung. Silakan cek kembali nanti atau hubungi pihak
                            sekolah untuk informasi jadwal PPDB berikutnya.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </>
    );
}

PpdbBelumDibuka.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
