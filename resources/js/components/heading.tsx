export default function Heading({ title, description }: { title: string; description?: string }) {
    return (
        <div className="min-w-0 flex-1 space-y-0.5">
            <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-muted-foreground text-sm break-words">{description}</p>}
        </div>
    );
}
