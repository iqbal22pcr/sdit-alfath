import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface DonutSlice {
    key: string;
    label: string;
    value: number;
    color: string;
}

interface DonutTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: DonutSlice }>;
    valueFormatter?: (value: number) => string;
}

function DonutTooltip({ active, payload, valueFormatter }: DonutTooltipProps) {
    if (!active || !payload?.length) return null;

    const slice = payload[0].payload;

    return (
        <div className="rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
            <p className="font-medium">{slice.label}</p>
            <p className="text-muted-foreground">{valueFormatter ? valueFormatter(slice.value) : slice.value}</p>
        </div>
    );
}

/**
 * Donut chart + a text legend/list (label + value) rendered side by side.
 * The list doubles as the chart's non-color-coded data view: every
 * category is always readable as text, not just as a wedge.
 */
export function DonutChart({
    data,
    valueFormatter,
    emptyLabel = 'Belum ada data.',
}: {
    data: DonutSlice[];
    valueFormatter?: (value: number) => string;
    emptyLabel?: string;
}) {
    const pieData = data.filter((slice) => slice.value > 0);

    if (pieData.length === 0) {
        return <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">{emptyLabel}</p>;
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-48 w-full shrink-0 sm:h-56 sm:w-56">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="label"
                            innerRadius="58%"
                            outerRadius="85%"
                            paddingAngle={pieData.length > 1 ? 2 : 0}
                            strokeWidth={0}
                            isAnimationActive={false}
                        >
                            {pieData.map((slice) => (
                                <Cell key={slice.key} fill={slice.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip valueFormatter={valueFormatter} />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <ul className="flex flex-1 flex-col gap-2 text-sm">
                {data.map((slice) => (
                    <li key={slice.key} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-foreground">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                            {slice.label}
                        </span>
                        <span className="font-medium">{valueFormatter ? valueFormatter(slice.value) : slice.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
