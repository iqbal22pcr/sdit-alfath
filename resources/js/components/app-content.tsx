import { SidebarInset } from '@/components/ui/sidebar';
import * as React from 'react';

type AppContentProps = React.ComponentProps<'div'>;

export function AppContent({ children, ...props }: AppContentProps) {
    return <SidebarInset {...props}>{children}</SidebarInset>;
}
