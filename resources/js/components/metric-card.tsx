import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

export type MetricCardTone = 'blue' | 'gold' | 'green' | 'red';

const TONE_CLASSES: Record<MetricCardTone, string> = {
    blue: 'bg-primary text-primary-foreground',
    gold: 'bg-gold text-white',
    green: 'bg-chart-3 text-white',
    red: 'bg-destructive text-destructive-foreground',
};

interface MetricCardProps {
    icon: LucideIcon;
    tone: MetricCardTone;
    label: string;
    value: string | number;
    className?: string;
}

export function MetricCard({ icon: Icon, tone, label, value, className }: MetricCardProps) {
    return (
        <Card className={cn('rounded-xl', className)}>
            <CardContent className="flex items-center gap-3 pt-6">
                <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', TONE_CLASSES[tone])}>
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-[13px] text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-2xl font-medium">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
