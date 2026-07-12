import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Fragment } from 'react';

interface StepperProps {
    steps: string[];
    currentStep: number;
    className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn('flex w-full items-start', className)}>
            {steps.map((label, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <Fragment key={label}>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                                    isCompleted && 'bg-green-600 text-white',
                                    isCurrent && 'bg-primary text-primary-foreground',
                                    !isCompleted && !isCurrent && 'border-2 border-muted-foreground/30 text-muted-foreground',
                                )}
                            >
                                {isCompleted ? <Check className="size-5" /> : stepNumber}
                            </div>
                            <span
                                className={cn(
                                    'text-[13px] font-medium whitespace-nowrap',
                                    isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground',
                                )}
                            >
                                {label}
                            </span>
                        </div>

                        {!isLast && (
                            <div className={cn('mt-[18px] h-0.5 flex-1', isCompleted ? 'bg-green-600' : 'bg-muted-foreground/30')} />
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}
