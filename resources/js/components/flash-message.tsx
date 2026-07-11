import { Alert, AlertDescription } from '@/components/ui/alert';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const AUTO_HIDE_MS = 4000;

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!flash.success && !flash.error && !flash.warning) return;

        setVisible(true);
        const timer = setTimeout(() => setVisible(false), AUTO_HIDE_MS);

        return () => clearTimeout(timer);
    }, [flash.success, flash.error, flash.warning]);

    if (!visible || (!flash.success && !flash.error && !flash.warning)) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
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
            {flash.warning && (
                <Alert className="border-yellow-500/50 bg-yellow-50 text-yellow-800 dark:border-yellow-500/50 dark:bg-yellow-950/40 dark:text-yellow-200">
                    <AlertDescription>{flash.warning}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
