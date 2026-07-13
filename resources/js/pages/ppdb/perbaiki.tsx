import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type FormDataConvertible } from '@inertiajs/core';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type JenisDokumen = 'akta' | 'kartu_keluarga' | 'ktp_orangtua' | 'pas_foto' | 'surat_kematian_ayah' | 'surat_keterangan_tidak_mampu';

interface WaliPpdbExisting {
    id: number;
    nama: string;
    nik: string;
    telepon: string;
    hubungan: 'ayah' | 'ibu' | 'wali';
}

interface DokumenPpdbExisting {
    id: number;
    jenis_dokumen: JenisDokumen;
    berkas: string;
    terverifikasi: boolean;
}

interface PendaftaranEditable {
    id: number;
    nomor_pendaftaran: string;
    nama_pendaftar: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: 'laki_laki' | 'perempuan';
    alamat: string;
    status_ayah: 'hidup' | 'meninggal';
    penghasilan_tetap: boolean;
    punya_saudara_di_sekolah: boolean;
    nama_saudara: string | null;
    catatan_verifikasi: string | null;
    wali_ppdb: WaliPpdbExisting[];
    dokumen_ppdb: DokumenPpdbExisting[];
}

interface WaliInput {
    nama: string;
    nik: string;
    telepon: string;
    hubungan: '' | 'ayah' | 'ibu' | 'wali';
    [key: string]: string;
}

interface DokumenInput {
    akta: File | null;
    kartu_keluarga: File | null;
    ktp_orangtua: File | null;
    pas_foto: File | null;
    surat_kematian_ayah: File | null;
    surat_keterangan_tidak_mampu: File | null;
    [key: string]: File | null;
}

interface PendaftaranForm {
    nama_pendaftar: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: '' | 'laki_laki' | 'perempuan';
    alamat: string;
    status_ayah: '' | 'hidup' | 'meninggal';
    penghasilan_tetap: '' | '1' | '0';
    punya_saudara_di_sekolah: '' | '1' | '0';
    nama_saudara: string;
    wali: WaliInput[];
    dokumen: DokumenInput;
    [key: string]: FormDataConvertible;
}

const emptyWali: WaliInput = { nama: '', nik: '', telepon: '', hubungan: '' };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Pendaftaran', href: '/ppdb/pendaftaran' },
    { title: 'Perbaiki Pendaftaran', href: '#' },
];

export default function PpdbPerbaiki({ pendaftaran }: { pendaftaran: PendaftaranEditable }) {
    const existingDokumen = new Map(pendaftaran.dokumen_ppdb.map((d) => [d.jenis_dokumen, d]));

    const form = useForm<PendaftaranForm>({
        nama_pendaftar: pendaftaran.nama_pendaftar,
        tempat_lahir: pendaftaran.tempat_lahir,
        tanggal_lahir: pendaftaran.tanggal_lahir.slice(0, 10),
        jenis_kelamin: pendaftaran.jenis_kelamin,
        alamat: pendaftaran.alamat,
        status_ayah: pendaftaran.status_ayah,
        penghasilan_tetap: pendaftaran.penghasilan_tetap ? '1' : '0',
        punya_saudara_di_sekolah: pendaftaran.punya_saudara_di_sekolah ? '1' : '0',
        nama_saudara: pendaftaran.nama_saudara ?? '',
        wali:
            pendaftaran.wali_ppdb.length > 0
                ? pendaftaran.wali_ppdb.map((w) => ({ nama: w.nama, nik: w.nik, telepon: w.telepon, hubungan: w.hubungan }))
                : [{ ...emptyWali }],
        dokumen: {
            akta: null,
            kartu_keluarga: null,
            ktp_orangtua: null,
            pas_foto: null,
            surat_kematian_ayah: null,
            surat_keterangan_tidak_mampu: null,
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Laravel/PHP never parses multipart/form-data bodies on a literal
        // PUT request (only POST), so a real form.put() with files would
        // arrive server-side with an empty body. POST with a spoofed
        // _method field is Inertia's documented workaround for file
        // uploads on update forms.
        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(route('ppdb.perbaiki.update', pendaftaran.id), {
            onError: (errors) => {
                const firstKey = Object.keys(errors)[0];
                if (!firstKey) return;

                document.getElementById(firstKey.replace(/[._]/g, '-'))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            },
        });
    };

    const addWali = () => {
        form.setData('wali', [...form.data.wali, { ...emptyWali }]);
    };

    const removeWali = (index: number) => {
        form.setData(
            'wali',
            form.data.wali.filter((_, i) => i !== index),
        );
    };

    const updateWali = (index: number, field: keyof WaliInput, value: string) => {
        form.setData(
            'wali',
            form.data.wali.map((wali, i) => (i === index ? { ...wali, [field]: value } : wali)),
        );
    };

    const updateDokumen = (jenis: keyof DokumenInput, file: File | null) => {
        form.setData('dokumen', { ...form.data.dokumen, [jenis]: file });
    };

    const butuhSuratKematianAyah = form.data.status_ayah === 'meninggal';
    const butuhSuratTidakMampu = form.data.penghasilan_tetap === '0';

    return (
        <>
            <Head title={`Perbaiki ${pendaftaran.nomor_pendaftaran}`} />

            <form onSubmit={submit} className="flex w-full flex-col gap-4">
                <Heading title="Perbaiki Pendaftaran" description={pendaftaran.nomor_pendaftaran} />

                {pendaftaran.catatan_verifikasi && (
                    <Alert className="border-[var(--border-warning)] bg-[var(--bg-warning)] text-[var(--text-warning)]">
                        <AlertTitle>Catatan dari Staf</AlertTitle>
                        <AlertDescription className="text-[var(--text-warning)]">{pendaftaran.catatan_verifikasi}</AlertDescription>
                    </Alert>
                )}

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>1. Data Anak</CardTitle>
                        <CardDescription>Data diri calon siswa yang didaftarkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nama-pendaftar">Nama Lengkap</Label>
                            <Input
                                id="nama-pendaftar"
                                value={form.data.nama_pendaftar}
                                onChange={(e) => form.setData('nama_pendaftar', e.target.value)}
                            />
                            <InputError message={form.errors.nama_pendaftar} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="tempat-lahir">Tempat Lahir</Label>
                                <Input
                                    id="tempat-lahir"
                                    value={form.data.tempat_lahir}
                                    onChange={(e) => form.setData('tempat_lahir', e.target.value)}
                                />
                                <InputError message={form.errors.tempat_lahir} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal-lahir">Tanggal Lahir</Label>
                                <Input
                                    id="tanggal-lahir"
                                    type="date"
                                    value={form.data.tanggal_lahir}
                                    onChange={(e) => form.setData('tanggal_lahir', e.target.value)}
                                />
                                <InputError message={form.errors.tanggal_lahir} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="jenis-kelamin">Jenis Kelamin</Label>
                            <Select value={form.data.jenis_kelamin} onValueChange={(value) => form.setData('jenis_kelamin', value as never)}>
                                <SelectTrigger id="jenis-kelamin">
                                    <SelectValue placeholder="Pilih jenis kelamin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="laki_laki">Laki-laki</SelectItem>
                                    <SelectItem value="perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.jenis_kelamin} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="alamat">Alamat</Label>
                            <Textarea id="alamat" value={form.data.alamat} onChange={(e) => form.setData('alamat', e.target.value)} />
                            <InputError message={form.errors.alamat} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>2. Kondisi Keluarga</CardTitle>
                        <CardDescription>Dipakai untuk menentukan kategori dan dokumen pendukung yang dibutuhkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="status-ayah">Status Ayah</Label>
                                <Select value={form.data.status_ayah} onValueChange={(value) => form.setData('status_ayah', value as never)}>
                                    <SelectTrigger id="status-ayah">
                                        <SelectValue placeholder="Pilih status ayah" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hidup">Hidup</SelectItem>
                                        <SelectItem value="meninggal">Meninggal</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.status_ayah} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="penghasilan-tetap">Apakah orang tua memiliki penghasilan tetap?</Label>
                                <Select
                                    value={form.data.penghasilan_tetap}
                                    onValueChange={(value) => form.setData('penghasilan_tetap', value as never)}
                                >
                                    <SelectTrigger id="penghasilan-tetap">
                                        <SelectValue placeholder="Pilih jawaban" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Ya</SelectItem>
                                        <SelectItem value="0">Tidak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.penghasilan_tetap} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="punya-saudara-di-sekolah">Apakah punya saudara kandung di sekolah ini?</Label>
                                <Select
                                    value={form.data.punya_saudara_di_sekolah}
                                    onValueChange={(value) => form.setData('punya_saudara_di_sekolah', value as never)}
                                >
                                    <SelectTrigger id="punya-saudara-di-sekolah">
                                        <SelectValue placeholder="Pilih jawaban" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Ya</SelectItem>
                                        <SelectItem value="0">Tidak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.punya_saudara_di_sekolah} />
                            </div>
                        </div>

                        {form.data.punya_saudara_di_sekolah === '1' && (
                            <div className="grid gap-2">
                                <Label htmlFor="nama-saudara">Nama Saudara</Label>
                                <Input
                                    id="nama-saudara"
                                    value={form.data.nama_saudara}
                                    onChange={(e) => form.setData('nama_saudara', e.target.value)}
                                />
                                <InputError message={form.errors.nama_saudara} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>3. Data Wali</CardTitle>
                        <CardDescription>Minimal satu wali (ayah, ibu, atau wali lainnya).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {form.data.wali.map((wali, index) => (
                            <div key={index} className="space-y-4 rounded-md border p-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium">Wali {index + 1}</h3>
                                    {form.data.wali.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeWali(index)}>
                                            Hapus
                                        </Button>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`wali-${index}-nama`}>Nama</Label>
                                    <Input id={`wali-${index}-nama`} value={wali.nama} onChange={(e) => updateWali(index, 'nama', e.target.value)} />
                                    <InputError message={form.errors[`wali.${index}.nama`]} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor={`wali-${index}-nik`}>NIK</Label>
                                        <Input id={`wali-${index}-nik`} value={wali.nik} onChange={(e) => updateWali(index, 'nik', e.target.value)} />
                                        <InputError message={form.errors[`wali.${index}.nik`]} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`wali-${index}-telepon`}>Telepon</Label>
                                        <Input
                                            id={`wali-${index}-telepon`}
                                            value={wali.telepon}
                                            onChange={(e) => updateWali(index, 'telepon', e.target.value)}
                                        />
                                        <InputError message={form.errors[`wali.${index}.telepon`]} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor={`wali-${index}-hubungan`}>Hubungan</Label>
                                    <Select value={wali.hubungan} onValueChange={(value) => updateWali(index, 'hubungan', value)}>
                                        <SelectTrigger id={`wali-${index}-hubungan`}>
                                            <SelectValue placeholder="Pilih hubungan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ayah">Ayah</SelectItem>
                                            <SelectItem value="ibu">Ibu</SelectItem>
                                            <SelectItem value="wali">Wali</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={form.errors[`wali.${index}.hubungan`]} />
                                </div>
                            </div>
                        ))}

                        <Button type="button" variant="outline" onClick={addWali}>
                            + Tambah Wali
                        </Button>
                        <InputError message={form.errors.wali} />
                    </CardContent>
                </Card>

                <Card className="rounded-xl">
                    <CardHeader>
                        <CardTitle>4. Upload Dokumen</CardTitle>
                        <CardDescription>
                            Format PDF, JPG, atau PNG, maksimal 2MB per file. Biarkan kosong kalau tidak ingin mengganti file yang sudah ada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DokumenField
                            id="dokumen-akta"
                            label="Akta Kelahiran"
                            error={form.errors['dokumen.akta']}
                            existing={existingDokumen.get('akta')}
                            onChange={(file) => updateDokumen('akta', file)}
                        />
                        <DokumenField
                            id="dokumen-kartu-keluarga"
                            label="Kartu Keluarga"
                            error={form.errors['dokumen.kartu_keluarga']}
                            existing={existingDokumen.get('kartu_keluarga')}
                            onChange={(file) => updateDokumen('kartu_keluarga', file)}
                        />
                        <DokumenField
                            id="dokumen-ktp-orangtua"
                            label="KTP Orang Tua"
                            error={form.errors['dokumen.ktp_orangtua']}
                            existing={existingDokumen.get('ktp_orangtua')}
                            onChange={(file) => updateDokumen('ktp_orangtua', file)}
                        />
                        <DokumenField
                            id="dokumen-pas-foto"
                            label="Pas Foto"
                            error={form.errors['dokumen.pas_foto']}
                            existing={existingDokumen.get('pas_foto')}
                            onChange={(file) => updateDokumen('pas_foto', file)}
                        />

                        {butuhSuratKematianAyah && (
                            <DokumenField
                                id="dokumen-surat-kematian-ayah"
                                label="Surat Kematian Ayah"
                                error={form.errors['dokumen.surat_kematian_ayah']}
                                existing={existingDokumen.get('surat_kematian_ayah')}
                                onChange={(file) => updateDokumen('surat_kematian_ayah', file)}
                            />
                        )}

                        {butuhSuratTidakMampu && (
                            <DokumenField
                                id="dokumen-surat-keterangan-tidak-mampu"
                                label="Surat Keterangan Tidak Mampu"
                                error={form.errors['dokumen.surat_keterangan_tidak_mampu']}
                                existing={existingDokumen.get('surat_keterangan_tidak_mampu')}
                                onChange={(file) => updateDokumen('surat_keterangan_tidak_mampu', file)}
                            />
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        Kirim Perbaikan
                    </Button>
                </div>
            </form>
        </>
    );
}

PpdbPerbaiki.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function DokumenField({
    id,
    label,
    error,
    existing,
    onChange,
}: {
    id: string;
    label: string;
    error?: string;
    existing?: DokumenPpdbExisting;
    onChange: (file: File | null) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {existing && (
                <p className="text-muted-foreground text-sm">
                    File saat ini:{' '}
                    <a
                        href={`/storage/${existing.berkas}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                    >
                        Lihat File
                    </a>
                    . Pilih file baru di bawah untuk mengganti, atau biarkan kosong.
                </p>
            )}
            <Input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
            <InputError message={error} />
        </div>
    );
}
