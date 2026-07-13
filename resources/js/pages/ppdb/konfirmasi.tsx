import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarTrigger } from '@/components/ui/sidebar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pendaftaran', href: '/ppdb/pendaftaran' }];

export default function PpdbKonfirmasi({ nomorPendaftaran, namaPendaftar }: { nomorPendaftaran: string; namaPendaftar: string }) {
    return (
        <>
            <Head title="Pendaftaran Berhasil" />

            <div className="flex w-full flex-col gap-4">
                <SidebarTrigger className="-ml-1 lg:hidden" />

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>Pendaftaran Berhasil Dikirim</CardTitle>
                        <CardDescription>
                            Pendaftaran atas nama <span className="text-foreground font-medium">{namaPendaftar}</span> telah kami terima dan sedang
                            menunggu verifikasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">Nomor pendaftaran Anda:</p>
                            <p className="bg-muted rounded-md border px-4 py-3 text-lg font-semibold tracking-wide">{nomorPendaftaran}</p>
                            <p className="text-muted-foreground text-sm">
                                Nomor ini berguna sebagai referensi kalau Anda perlu menghubungi pihak sekolah. Anda bisa memantau status pendaftaran
                                kapan saja lewat menu Pendaftaran.
                            </p>
                        </div>

                        <Button asChild>
                            <Link href={route('ppdb.pendaftaran')}>Lihat Status Pendaftaran</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

PpdbKonfirmasi.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
