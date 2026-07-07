import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    const { flash } = usePage<SharedData>().props;

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />

                {(flash.success || flash.error) && (
                    <div className="px-4 pt-4">
                        {flash.success && (
                            <Alert>
                                <AlertDescription>{flash.success}</AlertDescription>
                            </Alert>
                        )}
                        {flash.error && (
                            <Alert variant="destructive">
                                <AlertDescription>{flash.error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                {children}
            </AppContent>
        </AppShell>
    );
}
