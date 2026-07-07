import InputError from '@/components/input-error';
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

const emptyForm: PendaftaranForm = {
    nama_pendaftar: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    status_ayah: '',
    penghasilan_tetap: '',
    punya_saudara_di_sekolah: '',
    nama_saudara: '',
    wali: [{ ...emptyWali }],
    dokumen: {
        akta: null,
        kartu_keluarga: null,
        ktp_orangtua: null,
        pas_foto: null,
        surat_kematian_ayah: null,
        surat_keterangan_tidak_mampu: null,
    },
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pendaftaran PPDB', href: '/ppdb/daftar' }];

export default function PpdbDaftar({ gelombang }: { gelombang: { id: number; nama: string } }) {
    const form = useForm<PendaftaranForm>(emptyForm);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('ppdb.store'));
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pendaftaran PPDB" />

            <form onSubmit={submit} className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
                <div>
                    <h1 className="text-xl font-semibold">Formulir Pendaftaran PPDB</h1>
                    <p className="text-sm text-muted-foreground">Gelombang: {gelombang.nama}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>1. Data Anak</CardTitle>
                        <CardDescription>Data diri calon siswa yang didaftarkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nama_pendaftar">Nama Lengkap</Label>
                            <Input
                                id="nama_pendaftar"
                                value={form.data.nama_pendaftar}
                                onChange={(e) => form.setData('nama_pendaftar', e.target.value)}
                            />
                            <InputError message={form.errors.nama_pendaftar} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="tempat_lahir">Tempat Lahir</Label>
                                <Input
                                    id="tempat_lahir"
                                    value={form.data.tempat_lahir}
                                    onChange={(e) => form.setData('tempat_lahir', e.target.value)}
                                />
                                <InputError message={form.errors.tempat_lahir} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                                <Input
                                    id="tanggal_lahir"
                                    type="date"
                                    value={form.data.tanggal_lahir}
                                    onChange={(e) => form.setData('tanggal_lahir', e.target.value)}
                                />
                                <InputError message={form.errors.tanggal_lahir} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                            <Select value={form.data.jenis_kelamin} onValueChange={(value) => form.setData('jenis_kelamin', value as never)}>
                                <SelectTrigger id="jenis_kelamin">
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

                <Card>
                    <CardHeader>
                        <CardTitle>2. Kondisi Keluarga</CardTitle>
                        <CardDescription>Dipakai untuk menentukan kategori dan dokumen pendukung yang dibutuhkan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status_ayah">Status Ayah</Label>
                            <Select value={form.data.status_ayah} onValueChange={(value) => form.setData('status_ayah', value as never)}>
                                <SelectTrigger id="status_ayah">
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
                            <Label htmlFor="penghasilan_tetap">Apakah orang tua memiliki penghasilan tetap?</Label>
                            <Select
                                value={form.data.penghasilan_tetap}
                                onValueChange={(value) => form.setData('penghasilan_tetap', value as never)}
                            >
                                <SelectTrigger id="penghasilan_tetap">
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
                            <Label htmlFor="punya_saudara_di_sekolah">Apakah punya saudara kandung di sekolah ini?</Label>
                            <Select
                                value={form.data.punya_saudara_di_sekolah}
                                onValueChange={(value) => form.setData('punya_saudara_di_sekolah', value as never)}
                            >
                                <SelectTrigger id="punya_saudara_di_sekolah">
                                    <SelectValue placeholder="Pilih jawaban" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Ya</SelectItem>
                                    <SelectItem value="0">Tidak</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.punya_saudara_di_sekolah} />
                        </div>

                        {form.data.punya_saudara_di_sekolah === '1' && (
                            <div className="grid gap-2">
                                <Label htmlFor="nama_saudara">Nama Saudara</Label>
                                <Input
                                    id="nama_saudara"
                                    value={form.data.nama_saudara}
                                    onChange={(e) => form.setData('nama_saudara', e.target.value)}
                                />
                                <InputError message={form.errors.nama_saudara} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
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
                                    <Input
                                        id={`wali-${index}-nama`}
                                        value={wali.nama}
                                        onChange={(e) => updateWali(index, 'nama', e.target.value)}
                                    />
                                    <InputError message={form.errors[`wali.${index}.nama`]} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor={`wali-${index}-nik`}>NIK</Label>
                                        <Input
                                            id={`wali-${index}-nik`}
                                            value={wali.nik}
                                            onChange={(e) => updateWali(index, 'nik', e.target.value)}
                                        />
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

                <Card>
                    <CardHeader>
                        <CardTitle>4. Upload Dokumen</CardTitle>
                        <CardDescription>Format PDF, JPG, atau PNG, maksimal 2MB per file.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <DokumenField
                            id="dokumen-akta"
                            label="Akta Kelahiran"
                            error={form.errors['dokumen.akta']}
                            onChange={(file) => updateDokumen('akta', file)}
                        />
                        <DokumenField
                            id="dokumen-kartu-keluarga"
                            label="Kartu Keluarga"
                            error={form.errors['dokumen.kartu_keluarga']}
                            onChange={(file) => updateDokumen('kartu_keluarga', file)}
                        />
                        <DokumenField
                            id="dokumen-ktp-orangtua"
                            label="KTP Orang Tua"
                            error={form.errors['dokumen.ktp_orangtua']}
                            onChange={(file) => updateDokumen('ktp_orangtua', file)}
                        />
                        <DokumenField
                            id="dokumen-pas-foto"
                            label="Pas Foto"
                            error={form.errors['dokumen.pas_foto']}
                            onChange={(file) => updateDokumen('pas_foto', file)}
                        />

                        {butuhSuratKematianAyah && (
                            <DokumenField
                                id="dokumen-surat-kematian-ayah"
                                label="Surat Kematian Ayah"
                                error={form.errors['dokumen.surat_kematian_ayah']}
                                onChange={(file) => updateDokumen('surat_kematian_ayah', file)}
                            />
                        )}

                        {butuhSuratTidakMampu && (
                            <DokumenField
                                id="dokumen-surat-tidak-mampu"
                                label="Surat Keterangan Tidak Mampu"
                                error={form.errors['dokumen.surat_keterangan_tidak_mampu']}
                                onChange={(file) => updateDokumen('surat_keterangan_tidak_mampu', file)}
                            />
                        )}
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={form.processing}>
                        Submit Pendaftaran
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}

function DokumenField({
    id,
    label,
    error,
    onChange,
}: {
    id: string;
    label: string;
    error?: string;
    onChange: (file: File | null) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
            <InputError message={error} />
        </div>
    );
}
