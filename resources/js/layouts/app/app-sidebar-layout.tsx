import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { FlashMessage } from '@/components/flash-message';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    return (
        <AppShell>
            <AppSidebar />
            <AppContent>
                <AppSidebarHeader breadcrumbs={breadcrumbs} />

                <FlashMessage />

                <div className="px-8 py-6">{children}</div>
            </AppContent>
        </AppShell>
    );
}
