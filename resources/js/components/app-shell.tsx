import { SidebarProvider } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

interface AppShellProps {
    children: React.ReactNode;
}

// Matches Tailwind's `lg` breakpoint. Above it the sidebar is always
// open and the trigger is hidden (see SidebarTrigger usages), so the
// open state below is forced to true regardless of what's stored.
const DESKTOP_QUERY = '(min-width: 1024px)';

export function AppShell({ children }: AppShellProps) {
    const [isOpen, setIsOpen] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('sidebar') !== 'false' : true));
    const [isDesktop, setIsDesktop] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : true));

    useEffect(() => {
        const mql = window.matchMedia(DESKTOP_QUERY);
        const onChange = () => setIsDesktop(mql.matches);

        onChange();
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    const handleSidebarChange = (open: boolean) => {
        setIsOpen(open);

        if (typeof window !== 'undefined') {
            localStorage.setItem('sidebar', String(open));
        }
    };

    // A previously-collapsed sidebar (from before this always-open-on-desktop
    // rule existed, or a stray keyboard-shortcut toggle) must never leave a
    // desktop user stuck with no way to reopen it -- the trigger is hidden
    // above `lg`, so `isDesktop` always wins over the stored preference.
    return (
        <SidebarProvider defaultOpen={isOpen} open={isDesktop || isOpen} onOpenChange={handleSidebarChange}>
            {children}
        </SidebarProvider>
    );
}
