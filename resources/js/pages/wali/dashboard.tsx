import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { FileText, Receipt } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/wali/dashboard' }];

export default function WaliDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 p-4">
                <Heading title="Dashboard" description="Kelola pendaftaran dan tagihan anak Anda dari sini." />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link href={route('ppdb.pendaftaran')} className="block">
                        <Card className="h-full transition hover:bg-accent/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="size-5" />
                                    Pendaftaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                Lihat riwayat pendaftaran PPDB anak Anda, atau daftarkan anak baru.
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={route('wali.tagihan.index')} className="block">
                        <Card className="h-full transition hover:bg-accent/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Receipt className="size-5" />
                                    Tagihan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">Pantau tagihan dan riwayat pembayaran anak Anda.</CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
