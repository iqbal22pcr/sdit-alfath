import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    BookMarked,
    BookOpen,
    Calendar,
    CalendarRange,
    ClipboardList,
    FileText,
    Folder,
    GraduationCap,
    History,
    LayoutGrid,
    Receipt,
    Tags,
} from 'lucide-react';
import AppLogo from './app-logo';

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

// Roles that land on their own dedicated dashboard after login don't
// need the generic starter-kit "Dashboard" link cluttering the sidebar.
const ROLES_WITH_OWN_DASHBOARD = ['staf_ppdb', 'staf_keuangan', 'wali_murid', 'siswa'];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        ...(! ROLES_WITH_OWN_DASHBOARD.includes(auth.user.role)
            ? [
                  {
                      title: 'Dashboard',
                      url: '/dashboard',
                      icon: LayoutGrid,
                  },
              ]
            : []),
        ...(auth.user.role === 'admin'
            ? [
                  {
                      title: 'Kategori Siswa',
                      url: route('kategori-siswa.index'),
                      icon: Tags,
                  },
                  {
                      title: 'Gelombang PPDB',
                      url: route('gelombang-ppdb.index'),
                      icon: CalendarRange,
                  },
                  {
                      title: 'Tahun Ajaran',
                      url: route('tahun-ajaran.index'),
                      icon: Calendar,
                  },
              ]
            : []),
        ...(auth.user.role === 'staf_ppdb'
            ? [
                  {
                      title: 'Dashboard PPDB',
                      url: route('staf.ppdb-dashboard'),
                      icon: ClipboardList,
                  },
                  {
                      title: 'Monitoring Aktivasi',
                      url: route('staf.aktivasi-bermasalah'),
                      icon: AlertTriangle,
                  },
              ]
            : []),
        ...(auth.user.role === 'staf_keuangan'
            ? [
                  {
                      title: 'Kelola Tagihan',
                      url: route('staf.tagihan.index'),
                      icon: Receipt,
                  },
              ]
            : []),
        ...(auth.user.role === 'wali_murid'
            ? [
                  {
                      title: 'Anak Saya',
                      url: route('wali.siswa.index'),
                      icon: GraduationCap,
                  },
                  {
                      title: 'Daftar PPDB',
                      url: route('ppdb.create'),
                      icon: FileText,
                  },
                  {
                      title: 'Riwayat Pendaftaran PPDB',
                      url: route('ppdb.riwayat'),
                      icon: History,
                  },
              ]
            : []),
        ...(auth.user.role === 'siswa'
            ? [
                  {
                      title: 'Dashboard Akademik',
                      url: route('siswa.dashboard'),
                      icon: BookMarked,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
