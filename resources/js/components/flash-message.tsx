import { Alert, AlertDescription } from '@/components/ui/alert';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const AUTO_HIDE_MS = 4000;

export function FlashMessage() {
    const { flash } = usePage<SharedData>().props;
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!flash.success && !flash.error) return;

        setVisible(true);
        const timer = setTimeout(() => setVisible(false), AUTO_HIDE_MS);

        return () => clearTimeout(timer);
    }, [flash.success, flash.error]);

    if (!visible || (!flash.success && !flash.error)) {
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
        </div>
    );
}
