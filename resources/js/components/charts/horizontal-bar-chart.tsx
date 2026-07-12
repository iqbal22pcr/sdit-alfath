import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface BarDatum {
    key: string;
    label: string;
    value: number;
    color: string;
}

interface BarTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: BarDatum }>;
    valueFormatter?: (value: number) => string;
}

function BarTooltip({ active, payload, valueFormatter }: BarTooltipProps) {
    if (!active || !payload?.length) return null;

    const datum = payload[0].payload;

    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
            <p className="font-medium">{datum.label}</p>
            <p className="text-muted-foreground">{valueFormatter ? valueFormatter(datum.value) : datum.value}</p>
        </div>
    );
}

/**
 * Single-series horizontal bar chart: one bar per category, each with
 * its own color and a direct value label at the bar's end.
 */
export function HorizontalBarChart({
    data,
    valueFormatter,
    labelFormatter,
    emptyLabel = 'Belum ada data.',
}: {
    data: BarDatum[];
    valueFormatter?: (value: number) => string;
    /** Short form for the label drawn at the bar's end (defaults to valueFormatter). The
     *  tooltip always uses valueFormatter, so a compact label can't hide precision. */
    labelFormatter?: (value: number) => string;
    emptyLabel?: string;
}) {
    if (data.every((datum) => datum.value === 0)) {
        return <p className="flex h-40 items-center justify-center text-sm text-muted-foreground">{emptyLabel}</p>;
    }

    const formatLabel = labelFormatter ?? valueFormatter;

    return (
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 48)}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
                {/* 35% headroom past the longest bar guarantees room for its
                    end label, regardless of container width -- otherwise the
                    longest bar fills the plot area and its label spills past
                    the card edge (clipped, unreadable on narrow screens). */}
                <XAxis type="number" hide domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.35)]} />
                <YAxis
                    type="category"
                    dataKey="label"
                    width={96}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip content={<BarTooltip valueFormatter={valueFormatter} />} cursor={{ fill: 'var(--accent)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                    {data.map((datum) => (
                        <Cell key={datum.key} fill={datum.color} />
                    ))}
                    <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value) => (formatLabel ? formatLabel(Number(value)) : String(value))}
                        style={{ fill: 'var(--foreground)', fontSize: 12 }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
