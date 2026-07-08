import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar, CalendarRange, ClipboardList, Folder, GraduationCap, LayoutGrid, Receipt, Tags } from 'lucide-react';
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

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        },
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
