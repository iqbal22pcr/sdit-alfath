export function formatRupiah(nominal: number): string {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nominal);
}

/**
 * Short "Rp6 jt" / "Rp750 rb" form for tight spaces (e.g. a bar chart's
 * end label) where the full formatRupiah() string would overflow. Not a
 * replacement for formatRupiah() elsewhere -- precision still belongs in
 * tooltips, tables, and anywhere the exact amount matters.
 */
export function formatRupiahSingkat(nominal: number): string {
    const absolut = Math.abs(nominal);

    if (absolut >= 1_000_000_000) {
        return `Rp${(nominal / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`;
    }

    if (absolut >= 1_000_000) {
        return `Rp${(nominal / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
    }

    if (absolut >= 1_000) {
        return `Rp${(nominal / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 })} rb`;
    }

    return formatRupiah(nominal);
}

export function formatTanggal(iso: string): string {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}
