import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface EmptyStateAction {
    label: string;
    href?: string;
    onClick?: () => void;
}

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: EmptyStateAction;
    className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-1 px-4 py-10 text-center', className)}>
            <p className="text-sm font-medium">{title}</p>
            {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
            {action && (
                <div className="mt-3">
                    {action.href ? (
                        <Button size="sm" asChild>
                            <Link href={action.href}>{action.label}</Link>
                        </Button>
                    ) : (
                        <Button size="sm" onClick={action.onClick}>
                            {action.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
