import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Flash {
    success?: string | null;
    error?: string | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: Flash;
    [key: string]: unknown;
}

export type Role = 'admin' | 'kepala_sekolah' | 'guru' | 'staf_keuangan' | 'staf_ppdb' | 'wali_murid' | 'siswa';

export interface User {
    id: number;
    name: string;
    email: string | null;
    username: string | null;
    avatar?: string;
    email_verified_at: string | null;
    role: Role;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
