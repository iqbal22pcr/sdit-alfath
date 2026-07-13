import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export interface SimplePaginationMeta {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

/**
 * Previous/Next pager for a Laravel paginate() response passed through
 * as-is to Inertia. prev_page_url/next_page_url already carry every
 * other active query param (search/status/jenis/sort_by/sort_dir)
 * because the controller calls withQueryString(), so navigating here
 * never drops the caller's filters.
 */
export function SimplePagination({ meta, itemLabel = 'data' }: { meta: SimplePaginationMeta; itemLabel?: string }) {
    return (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
                {meta.total > 0 ? `Menampilkan ${meta.from}-${meta.to} dari ${meta.total} ${itemLabel}` : `Tidak ada ${itemLabel}.`}
            </p>

            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                    Halaman {meta.current_page} dari {Math.max(meta.last_page, 1)}
                </span>

                <div className="flex gap-2">
                    {meta.prev_page_url ? (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={meta.prev_page_url} preserveState preserveScroll>
                                Previous
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled>
                            Previous
                        </Button>
                    )}

                    {meta.next_page_url ? (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={meta.next_page_url} preserveState preserveScroll>
                                Next
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled>
                            Next
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
