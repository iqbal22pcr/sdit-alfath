import { type Role } from '@/types';

const ROLE_LABEL: Record<Role, string> = {
    admin: 'Admin',
    kepala_sekolah: 'Kepala Sekolah',
    guru: 'Guru',
    staf_keuangan: 'Staf Keuangan',
    staf_ppdb: 'Staf PPDB',
    wali_murid: 'Wali Murid',
};

export function roleLabel(role: Role): string {
    return ROLE_LABEL[role] ?? role;
}
