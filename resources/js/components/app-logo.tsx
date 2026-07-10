export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary flex aspect-square size-8 items-center justify-center rounded-md p-1">
                <img src="/images/logo-alfath.jpg" alt="Logo SDIT Al-Fath" className="size-full rounded-sm object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">SDIT Al-Fath</span>
            </div>
        </>
    );
}
