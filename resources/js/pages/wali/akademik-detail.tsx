import { EmptyState } from '@/components/empty-state';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface SiswaDetail {
    id: number;
    nama: string;
}

export default function WaliAkademikDetail({ siswa }: { siswa: SiswaDetail }) {
    return (
        <>
            <Head title={`Akademik - ${siswa.nama}`} />

            <div className="flex flex-col gap-4 p-4">
                <Heading title={`Akademik ${siswa.nama}`} description="Ringkasan akademik anak Anda." />

                <Card className="rounded-xl">
                    <CardContent>
                        <EmptyState
                            title="Modul Akademik Sedang Dalam Pengembangan"
                            description="Modul akademik (jadwal, absensi, nilai) sedang dalam pengembangan dan akan tersedia di sini."
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

WaliAkademikDetail.layout = (page: React.ReactElement<{ siswa: SiswaDetail }>) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Akademik', href: '/wali/akademik' },
        { title: page.props.siswa.nama, href: `/wali/akademik/${page.props.siswa.id}` },
    ];

    return <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
};
