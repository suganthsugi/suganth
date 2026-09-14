import { prisma } from "@/lib/prisma";
import SocialLinks from "@/components/SocialLinks";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [config, socialLinks] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <section className="max-w-[640px] pb-11 pt-4 sm:pt-8">
        <p
          className="reveal eyebrow mb-5 text-accent"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          Contact
        </p>
        <h1
          className="reveal m-0 mb-[18px] font-serif text-[clamp(32px,4.6vw,50px)] font-normal leading-[1.08] tracking-tight text-ink"
          style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
        >
          Tell me what you&rsquo;re building.
        </h1>
        <p
          className="reveal m-0 text-pretty text-base leading-relaxed text-ink2"
          style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
        >
          {config?.availability
            ? "Consulting, contract work, or a question about something I wrote. I answer everything within a couple of days."
            : "A question about something I wrote, or just to say hi."}
        </p>
      </section>

      <section
        className="reveal grid gap-x-14 gap-y-10 pb-[88px] sm:grid-cols-[minmax(0,1fr)_260px]"
        style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
      >
        <div className="max-w-[560px]">
          <ContactForm email={config?.email} />
        </div>

        {(socialLinks.length > 0 || config?.email) && (
          <div className="border-line pl-0 sm:border-l sm:pl-6">
            <p className="eyebrow mb-4 text-ink2">Reach me via</p>
            <SocialLinks links={socialLinks} email={config?.email} variant="stacked" />
            {config?.location && (
              <p className="m-0 mt-[22px] text-[13px] leading-relaxed text-ink2">
                Based in {config.location}.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
