import { prisma } from "@/lib/prisma";
import SocialLinks from "@/components/SocialLinks";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [config, socialLinks] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
  ]);

  const tools = (config?.tools ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const hasSidebar =
    config?.currentRole || config?.location || tools.length > 0 || socialLinks.length > 0 || config?.email;

  return (
    <div>
      <section className="max-w-[700px] pb-12 pt-4 sm:pt-8">
        <p
          className="reveal eyebrow mb-5 text-accent"
          style={{ "--reveal-delay": "0ms" } as React.CSSProperties}
        >
          About
        </p>
        <h1
          className="reveal m-0 text-pretty font-serif text-[clamp(38px,6vw,58px)] font-normal leading-[1.04] tracking-tight text-ink"
          style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
        >
          {config?.ownerName ? `About ${config.ownerName}` : "About"}
        </h1>
      </section>

      <section
        className={`reveal grid gap-x-14 gap-y-10 pb-20 ${
          hasSidebar ? "sm:grid-cols-[minmax(0,1fr)_270px]" : ""
        }`}
        style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
      >
        <div className="max-w-[620px]">
          {config?.aboutHtml ? (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: config.aboutHtml }}
            />
          ) : config?.bio ? (
            <p className="m-0 text-pretty text-[17px] leading-[1.8] text-ink2">
              {config.bio}
            </p>
          ) : null}
        </div>

        {hasSidebar && (
          <div className="flex flex-col gap-7 border-line pl-0 sm:border-l sm:pl-6">
            {(config?.currentRole || config?.location) && (
              <div>
                <p className="eyebrow mb-2.5 text-ink2">Currently</p>
                <p className="m-0 text-sm leading-relaxed text-ink">
                  {config?.currentRole}
                  {config?.currentRole && config?.location && <br />}
                  {config?.location}
                </p>
              </div>
            )}
            {tools.length > 0 && (
              <div>
                <p className="eyebrow mb-2.5 text-ink2">Tools</p>
                <p className="m-0 text-sm leading-[1.9] text-ink">
                  {tools.join(" · ")}
                </p>
              </div>
            )}
            {(socialLinks.length > 0 || config?.email) && (
              <div>
                <p className="eyebrow mb-2.5 text-ink2">Elsewhere</p>
                <SocialLinks
                  links={socialLinks}
                  email={config?.email}
                  variant="stacked"
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
