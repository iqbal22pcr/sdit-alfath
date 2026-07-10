export type StatusTone = 'gray' | 'blue' | 'amber' | 'green' | 'red';

const TONE_CLASSES: Record<StatusTone, string> = {
    gray: 'border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    blue: 'border-transparent bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-200',
    amber: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    green: 'border-transparent bg-green-100 text-[#157347] dark:bg-green-950 dark:text-green-300',
    red: 'border-transparent bg-red-100 text-[#B42318] dark:bg-red-950 dark:text-red-300',
};

const STATUS_TONE: Record<string, StatusTone> = {
    draft: 'gray',
    keluar: 'gray',
    alumni: 'gray',
    tidak_aktif: 'gray',
    tutup: 'gray',

    diajukan: 'blue',
    diverifikasi: 'blue',
    calon: 'blue',

    perlu_perbaikan: 'amber',
    sebagian: 'amber',

    diterima: 'green',
    aktif: 'green',
    lunas: 'green',
    buka: 'green',
    tersedia: 'green',

    ditolak: 'red',
    belum_bayar: 'red',
    terlambat: 'red',
    penuh: 'red',
};

export function statusBadgeClass(status: string): string {
    const tone = STATUS_TONE[status] ?? 'gray';
    return TONE_CLASSES[tone];
}
