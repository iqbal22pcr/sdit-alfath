import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pendaftaran PPDB', href: '/ppdb/daftar' }];

export default function PpdbKonfirmasi({ nomorPendaftaran, namaPendaftar }: { nomorPendaftaran: string; namaPendaftar: string }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendaftaran Berhasil" />

            <div className="mx-auto w-full max-w-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Pendaftaran Berhasil Dikirim</CardTitle>
                        <CardDescription>
                            Pendaftaran atas nama <span className="font-medium text-foreground">{namaPendaftar}</span> telah kami terima dan
                            sedang menunggu verifikasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">Nomor pendaftaran Anda:</p>
                        <p className="rounded-md border bg-muted px-4 py-3 text-lg font-semibold tracking-wide">{nomorPendaftaran}</p>
                        <p className="text-sm text-muted-foreground">
                            Simpan nomor ini baik-baik. Nomor pendaftaran dibutuhkan untuk memantau status verifikasi pendaftaran Anda.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
