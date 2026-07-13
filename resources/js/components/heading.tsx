import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Heading({
    title,
    description,
    withSidebarTrigger = false,
}: {
    title: string;
    description?: string;
    withSidebarTrigger?: boolean;
}) {
    return (
        <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-2">
                {withSidebarTrigger && <SidebarTrigger className="-ml-1 lg:hidden" />}
                <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
            </div>
            {description && <p className="text-muted-foreground text-sm break-words">{description}</p>}
        </div>
    );
}
