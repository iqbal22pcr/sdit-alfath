import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Stepper } from '@/components/stepper';
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
import { FormEventHandler, useState } from 'react';

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

// Every top-level field that belongs to Step 1 (Data & Akun). Anything
// not in this list (currently just dokumen.*) belongs to Step 2. Used
// both to gate the "Lanjut" button and to figure out which step to
// jump back to when the server returns an error for a field the user
// can no longer see.
const STEP_1_FIELDS = [
    'nama_pendaftar',
    'tempat_lahir',
    'tanggal_lahir',
    'jenis_kelamin',
    'alamat',
    'status_ayah',
    'penghasilan_tetap',
    'punya_saudara_di_sekolah',
    'nama_saudara',
    'wali',
];

function stepForField(field: string): 1 | 2 {
    // Nested keys like "wali.0.nama" or "dokumen.akta" only carry their
    // root segment in STEP_1_FIELDS.
    const root = field.split('.')[0];
    return STEP_1_FIELDS.includes(root) ? 1 : 2;
}

function scrollToField(field: string) {
    document.getElementById(field.replace(/[._]/g, '-'))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Client-side pre-check for Step 1, so "Lanjut" gives immediate
 * feedback instead of only failing once the user reaches the final
 * submit. This intentionally mirrors (not replaces) the server-side
 * rules in PendaftaranPpdbRequest -- the server still re-validates
 * everything on submit regardless of what this function says.
 */
function validateStep1(data: PendaftaranForm): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.nama_pendaftar.trim()) errors.nama_pendaftar = 'Nama lengkap wajib diisi.';
    if (!data.tempat_lahir.trim()) errors.tempat_lahir = 'Tempat lahir wajib diisi.';
    if (!data.tanggal_lahir) errors.tanggal_lahir = 'Tanggal lahir wajib diisi.';
    if (!data.jenis_kelamin) errors.jenis_kelamin = 'Jenis kelamin wajib dipilih.';
    if (!data.alamat.trim()) errors.alamat = 'Alamat wajib diisi.';
    if (!data.status_ayah) errors.status_ayah = 'Status ayah wajib dipilih.';
    if (data.penghasilan_tetap === '') errors.penghasilan_tetap = 'Wajib dipilih.';
    if (data.punya_saudara_di_sekolah === '') errors.punya_saudara_di_sekolah = 'Wajib dipilih.';
    if (data.punya_saudara_di_sekolah === '1' && !data.nama_saudara.trim()) {
        errors.nama_saudara = 'Nama saudara wajib diisi.';
    }

    data.wali.forEach((wali, index) => {
        if (!wali.nama.trim()) errors[`wali.${index}.nama`] = 'Nama wali wajib diisi.';
        if (!wali.nik.trim()) errors[`wali.${index}.nik`] = 'NIK wajib diisi.';
        if (!wali.telepon.trim()) errors[`wali.${index}.telepon`] = 'Telepon wajib diisi.';
        if (!wali.hubungan) errors[`wali.${index}.hubungan`] = 'Hubungan wajib dipilih.';
    });

    return errors;
}

export default function PpdbDaftar({ gelombang }: { gelombang: { id: number; nama: string } }) {
    const form = useForm<PendaftaranForm>(emptyForm);
    const [step, setStep] = useState<1 | 2>(1);
    const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

    const fieldError = (field: string): string | undefined => form.errors[field] ?? clientErrors[field];

    const handleNext = () => {
        const errors = validateStep1(form.data);

        if (Object.keys(errors).length > 0) {
            setClientErrors(errors);
            scrollToField(Object.keys(errors)[0]);
            return;
        }

        setClientErrors({});
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.post(route('ppdb.store'), {
            onError: (errors) => {
                const firstKey = Object.keys(errors)[0];
                if (!firstKey) return;

                const targetStep = stepForField(firstKey);

                if (targetStep !== step) {
                    setStep(targetStep);
                    // The field for this error doesn't exist in the DOM
                    // until the step above finishes re-rendering, so wait
                    // for the next paint before scrolling to it.
                    requestAnimationFrame(() => scrollToField(firstKey));
                } else {
                    scrollToField(firstKey);
                }
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
            <Head title="Pendaftaran PPDB" />

            <form onSubmit={submit} className="flex w-full flex-col gap-4">
                <Heading title="Formulir Pendaftaran PPDB" description={`Gelombang: ${gelombang.nama}`} withSidebarTrigger />

                <div className="flex w-full justify-center py-2">
                    <div className="w-full max-w-md">
                        <Stepper steps={['Data & Akun', 'Upload Dokumen']} currentStep={step} />
                    </div>
                </div>

                {step === 1 && (
                    <>
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
                                    <InputError message={fieldError('nama_pendaftar')} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tempat-lahir">Tempat Lahir</Label>
                                        <Input
                                            id="tempat-lahir"
                                            value={form.data.tempat_lahir}
                                            onChange={(e) => form.setData('tempat_lahir', e.target.value)}
                                        />
                                        <InputError message={fieldError('tempat_lahir')} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="tanggal-lahir">Tanggal Lahir</Label>
                                        <Input
                                            id="tanggal-lahir"
                                            type="date"
                                            value={form.data.tanggal_lahir}
                                            onChange={(e) => form.setData('tanggal_lahir', e.target.value)}
                                        />
                                        <InputError message={fieldError('tanggal_lahir')} />
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
                                    <InputError message={fieldError('jenis_kelamin')} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="alamat">Alamat</Label>
                                    <Textarea id="alamat" value={form.data.alamat} onChange={(e) => form.setData('alamat', e.target.value)} />
                                    <InputError message={fieldError('alamat')} />
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
                                        <InputError message={fieldError('status_ayah')} />
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
                                        <InputError message={fieldError('penghasilan_tetap')} />
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
                                        <InputError message={fieldError('punya_saudara_di_sekolah')} />
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
                                        <InputError message={fieldError('nama_saudara')} />
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
                                            <Input
                                                id={`wali-${index}-nama`}
                                                value={wali.nama}
                                                onChange={(e) => updateWali(index, 'nama', e.target.value)}
                                            />
                                            <InputError message={fieldError(`wali.${index}.nama`)} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor={`wali-${index}-nik`}>NIK</Label>
                                                <Input
                                                    id={`wali-${index}-nik`}
                                                    value={wali.nik}
                                                    onChange={(e) => updateWali(index, 'nik', e.target.value)}
                                                />
                                                <InputError message={fieldError(`wali.${index}.nik`)} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor={`wali-${index}-telepon`}>Telepon</Label>
                                                <Input
                                                    id={`wali-${index}-telepon`}
                                                    value={wali.telepon}
                                                    onChange={(e) => updateWali(index, 'telepon', e.target.value)}
                                                />
                                                <InputError message={fieldError(`wali.${index}.telepon`)} />
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
                                            <InputError message={fieldError(`wali.${index}.hubungan`)} />
                                        </div>
                                    </div>
                                ))}

                                <Button type="button" variant="outline" onClick={addWali}>
                                    + Tambah Wali
                                </Button>
                                <InputError message={fieldError('wali')} />
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button type="button" onClick={handleNext}>
                                Lanjut
                            </Button>
                        </div>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Card className="rounded-xl">
                            <CardHeader>
                                <CardTitle>4. Upload Dokumen</CardTitle>
                                <CardDescription>Format PDF, JPG, atau PNG, maksimal 2MB per file.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <DokumenField
                                    id="dokumen-akta"
                                    label="Akta Kelahiran"
                                    error={fieldError('dokumen.akta')}
                                    onChange={(file) => updateDokumen('akta', file)}
                                />
                                <DokumenField
                                    id="dokumen-kartu-keluarga"
                                    label="Kartu Keluarga"
                                    error={fieldError('dokumen.kartu_keluarga')}
                                    onChange={(file) => updateDokumen('kartu_keluarga', file)}
                                />
                                <DokumenField
                                    id="dokumen-ktp-orangtua"
                                    label="KTP Orang Tua"
                                    error={fieldError('dokumen.ktp_orangtua')}
                                    onChange={(file) => updateDokumen('ktp_orangtua', file)}
                                />
                                <DokumenField
                                    id="dokumen-pas-foto"
                                    label="Pas Foto"
                                    error={fieldError('dokumen.pas_foto')}
                                    onChange={(file) => updateDokumen('pas_foto', file)}
                                />

                                {butuhSuratKematianAyah && (
                                    <DokumenField
                                        id="dokumen-surat-kematian-ayah"
                                        label="Surat Kematian Ayah"
                                        error={fieldError('dokumen.surat_kematian_ayah')}
                                        onChange={(file) => updateDokumen('surat_kematian_ayah', file)}
                                    />
                                )}

                                {butuhSuratTidakMampu && (
                                    <DokumenField
                                        id="dokumen-surat-keterangan-tidak-mampu"
                                        label="Surat Keterangan Tidak Mampu"
                                        error={fieldError('dokumen.surat_keterangan_tidak_mampu')}
                                        onChange={(file) => updateDokumen('surat_keterangan_tidak_mampu', file)}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-between">
                            <Button type="button" variant="outline" onClick={handleBack}>
                                Kembali
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Submit Pendaftaran
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </>
    );
}

PpdbDaftar.layout = (page: React.ReactNode) => <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;

function DokumenField({ id, label, error, onChange }: { id: string; label: string; error?: string; onChange: (file: File | null) => void }) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
            <InputError message={error} />
        </div>
    );
}
