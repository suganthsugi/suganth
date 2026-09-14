import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[62vh] place-items-center px-0 py-20 text-center">
      <div className="max-w-[460px]">
        <p className="eyebrow mb-[22px] text-accent">Error 404</p>
        <h1
          className="m-0 mb-[22px] font-serif text-[clamp(52px,9vw,104px)] font-normal leading-[0.95] tracking-tight text-ink"
          style={{ animation: "flt 7s ease-in-out infinite" }}
        >
          Lost in orbit
        </h1>
        <p className="m-0 mb-[34px] text-pretty text-base leading-relaxed text-ink2">
          This page drifted out of range. Everything worth reading is still
          back on solid ground.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full border border-line px-[22px] py-3 font-label text-xs tracking-wide text-ink transition-[border-color,box-shadow,color] duration-200 hover:border-accent hover:text-accent hover:shadow-[0_0_30px_-6px_rgb(var(--glow)_/_var(--glow-a))]"
        >
          ← Take me home
        </Link>
      </div>
    </div>
  );
}
