import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/lib/format';
import { statusBadgeClass } from '@/lib/status-badge';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

type Status = 'draft' | 'diajukan' | 'diverifikasi' | 'perlu_perbaikan' | 'diterima' | 'ditolak';

interface WaliPpdb {
    id: number;
    nama: string;
    nik: string;
    telepon: string;
    hubungan: 'ayah' | 'ibu' | 'wali';
}

interface DokumenPpdb {
    id: number;
    jenis_dokumen: string;
    berkas: string;
    terverifikasi: boolean;
}

interface KuotaKategoriOption {
    kategori_siswa_id: number;
    nama: string;
    kuota: number;
    terpakai: number;
    penuh: boolean;
}

interface PendaftaranDetail {
    id: number;
    nomor_pendaftaran: string;
    nama_pendaftar: string;
    tanggal_lahir: string;
    tempat_lahir: string;
    jenis_kelamin: 'laki_laki' | 'perempuan';
    alamat: string;
    status_ayah: 'hidup' | 'meninggal';
    penghasilan_tetap: boolean;
    punya_saudara_di_sekolah: boolean;
    nama_saudara: string | null;
    status: Status;
    kategori_siswa_id: number | null;
    user: { id: number; name: string; email: string };
    wali_ppdb: WaliPpdb[];
    dokumen_ppdb: DokumenPpdb[];
    kategori_siswa: { id: number; nama: string } | null;
    gelombang_ppdb: { id: number; nama: string };
    verifikator: { id: number; name: string } | null;
}

interface VerifikasiForm {
    status: Status | '';
    kategori_siswa_id: string;
    catatan_verifikasi: string;
    [key: string]: string;
}

const STATUS_LABEL: Record<Status, string> = {
    draft: 'Draft',
    diajukan: 'Diajukan',
    diverifikasi: 'Diverifikasi',
    perlu_perbaikan: 'Perlu Perbaikan',
    diterima: 'Diterima',
    ditolak: 'Ditolak',
};

const JENIS_KELAMIN_LABEL: Record<PendaftaranDetail['jenis_kelamin'], string> = {
    laki_laki: 'Laki-laki',
    perempuan: 'Perempuan',
};

const STATUS_AYAH_LABEL: Record<PendaftaranDetail['status_ayah'], string> = {
    hidup: 'Hidup',
    meninggal: 'Meninggal',
};

const HUBUNGAN_LABEL: Record<WaliPpdb['hubungan'], string> = {
    ayah: 'Ayah',
    ibu: 'Ibu',
    wali: 'Wali',
};

const JENIS_DOKUMEN_LABEL: Record<string, string> = {
    akta: 'Akta Kelahiran',
    kartu_keluarga: 'Kartu Keluarga',
    ktp_orangtua: 'KTP Orang Tua',
    pas_foto: 'Pas Foto',
    surat_kematian_ayah: 'Surat Kematian Ayah',
    surat_keterangan_tidak_mampu: 'Surat Keterangan Tidak Mampu',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard PPDB', href: '/staf/ppdb-dashboard' },
    { title: 'Detail Verifikasi', href: '#' },
];

export default function StafPpdbVerifikasi({
    pendaftaran,
    kuotaKategori,
}: {
    pendaftaran: PendaftaranDetail;
    kuotaKategori: KuotaKategoriOption[];
}) {
    const form = useForm<VerifikasiForm>({
        status: '',
        kategori_siswa_id: pendaftaran.kategori_siswa_id ? String(pendaftaran.kategori_siswa_id) : '',
        catatan_verifikasi: '',
    });

    const submitVerifikasi = (status: 'diterima' | 'ditolak' | 'perlu_perbaikan') => {
        form.transform((data) => ({ ...data, status }));
        form.post(route('staf.ppdb.verifikasi.store', pendaftaran.id), { preserveScroll: true });
    };

    const kategoriDipilih = form.data.kategori_siswa_id !== '';
    const statusFinal = pendaftaran.status === 'diterima' || pendaftaran.status === 'ditolak';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verifikasi ${pendaftaran.nomor_pendaftaran}`} />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading title={pendaftaran.nomor_pendaftaran} description={`Gelombang: ${pendaftaran.gelombang_ppdb.nama}`} />
                    <Badge variant="outline" className={statusBadgeClass(pendaftaran.status)}>
                        {STATUS_LABEL[pendaftaran.status]}
                    </Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Anak</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <Field label="Nama Lengkap" value={pendaftaran.nama_pendaftar} />
                        <Field label="Akun Wali (Login)" value={`${pendaftaran.user.name} (${pendaftaran.user.email})`} />
                        <Field label="Tempat, Tanggal Lahir" value={`${pendaftaran.tempat_lahir}, ${formatTanggal(pendaftaran.tanggal_lahir)}`} />
                        <Field label="Jenis Kelamin" value={JENIS_KELAMIN_LABEL[pendaftaran.jenis_kelamin]} />
                        <Field label="Alamat" value={pendaftaran.alamat} className="col-span-2" />
                        <Field label="Status Ayah" value={STATUS_AYAH_LABEL[pendaftaran.status_ayah]} />
                        <Field label="Penghasilan Tetap" value={pendaftaran.penghasilan_tetap ? 'Ya' : 'Tidak'} />
                        <Field
                            label="Saudara di Sekolah"
                            value={pendaftaran.punya_saudara_di_sekolah ? `Ya (${pendaftaran.nama_saudara ?? '-'})` : 'Tidak'}
                        />
                        <Field label="Kategori Saat Ini" value={pendaftaran.kategori_siswa?.nama ?? 'Belum ditentukan'} />
                        <Field label="Diverifikasi Oleh" value={pendaftaran.verifikator?.name ?? '-'} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Wali</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendaftaran.wali_ppdb.length === 0 && <p className="text-sm text-muted-foreground">Belum ada data wali.</p>}
                        {pendaftaran.wali_ppdb.map((wali) => (
                            <div key={wali.id} className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border p-3 text-sm">
                                <Field label="Nama" value={wali.nama} />
                                <Field label="Hubungan" value={HUBUNGAN_LABEL[wali.hubungan]} />
                                <Field label="NIK" value={wali.nik} />
                                <Field label="Telepon" value={wali.telepon} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Dokumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendaftaran.dokumen_ppdb.length === 0 && <p className="text-sm text-muted-foreground">Belum ada dokumen diunggah.</p>}
                        <ul className="space-y-2">
                            {pendaftaran.dokumen_ppdb.map((dok) => (
                                <li key={dok.id} className="flex items-center justify-between text-sm">
                                    <span>{JENIS_DOKUMEN_LABEL[dok.jenis_dokumen] ?? dok.jenis_dokumen}</span>
                                    <a
                                        href={`/storage/${dok.berkas}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline-offset-4 hover:underline"
                                    >
                                        Lihat Berkas
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {statusFinal ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Verifikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Pendaftaran ini sudah final dengan status{' '}
                                <Badge variant="outline" className={statusBadgeClass(pendaftaran.status)}>
                                    {STATUS_LABEL[pendaftaran.status]}
                                </Badge>
                                , tidak bisa diverifikasi ulang lewat form ini.
                            </p>
                            <p>
                                Diverifikasi oleh: <span className="font-medium text-foreground">{pendaftaran.verifikator?.name ?? '-'}</span>
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Aksi Verifikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="kategori_siswa_id">Kategori (wajib dipilih untuk menerima)</Label>
                                <Select
                                    value={form.data.kategori_siswa_id}
                                    onValueChange={(value) => form.setData('kategori_siswa_id', value)}
                                >
                                    <SelectTrigger id="kategori_siswa_id">
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kuotaKategori.map((k) => (
                                            <SelectItem key={k.kategori_siswa_id} value={String(k.kategori_siswa_id)} disabled={k.penuh}>
                                                {k.nama} ({k.terpakai}/{k.kuota}){k.penuh ? ' — Penuh' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {form.errors.kategori_siswa_id && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.kategori_siswa_id}</p>}
                                {form.errors.status && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.status}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="catatan_verifikasi">Catatan untuk Orang Tua (wajib diisi untuk Minta Perbaikan)</Label>
                                <Textarea
                                    id="catatan_verifikasi"
                                    value={form.data.catatan_verifikasi}
                                    onChange={(e) => form.setData('catatan_verifikasi', e.target.value)}
                                    placeholder="Jelaskan apa yang perlu diperbaiki, mis. dokumen kurang jelas atau data belum lengkap."
                                />
                                {form.errors.catatan_verifikasi && (
                                    <p className="text-sm text-red-600 dark:text-red-400">{form.errors.catatan_verifikasi}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    disabled={form.processing || ! kategoriDipilih}
                                    onClick={() => submitVerifikasi('diterima')}
                                >
                                    Terima
                                </Button>
                                <Button type="button" variant="destructive" disabled={form.processing} onClick={() => submitVerifikasi('ditolak')}>
                                    Tolak
                                </Button>
                                <Button type="button" variant="outline" disabled={form.processing} onClick={() => submitVerifikasi('perlu_perbaikan')}>
                                    Minta Perbaikan
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
    return (
        <div className={className}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p>{value}</p>
        </div>
    );
}
