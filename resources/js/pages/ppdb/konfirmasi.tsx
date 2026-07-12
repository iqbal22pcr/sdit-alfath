import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pendaftaran', href: '/ppdb/pendaftaran' }];

export default function PpdbKonfirmasi({ nomorPendaftaran, namaPendaftar }: { nomorPendaftaran: string; namaPendaftar: string }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendaftaran Berhasil" />

            <div className="flex w-full flex-col gap-4 p-4">
                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>Pendaftaran Berhasil Dikirim</CardTitle>
                        <CardDescription>
                            Pendaftaran atas nama <span className="font-medium text-foreground">{namaPendaftar}</span> telah kami terima dan
                            sedang menunggu verifikasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Nomor pendaftaran Anda:</p>
                            <p className="rounded-md border bg-muted px-4 py-3 text-lg font-semibold tracking-wide">{nomorPendaftaran}</p>
                            <p className="text-sm text-muted-foreground">
                                Nomor ini berguna sebagai referensi kalau Anda perlu menghubungi pihak sekolah. Anda bisa memantau status
                                pendaftaran kapan saja lewat menu Pendaftaran.
                            </p>
                        </div>

                        <Button asChild>
                            <Link href={route('ppdb.pendaftaran')}>Lihat Status Pendaftaran</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
