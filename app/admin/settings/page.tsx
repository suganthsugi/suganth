import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import SocialLinksManager from "./SocialLinksManager";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [config, links] = await Promise.all([
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Site settings</h1>
        <p className="mt-1 text-sm text-muted">
          Configure how your portfolio presents itself.
        </p>
        <div className="mt-6">
          <SettingsForm
            initial={{
              title: config?.title ?? "My Portfolio",
              description: config?.description ?? "",
              defaultView: config?.defaultView ?? "card",
              ownerName: config?.ownerName ?? "",
              email: config?.email ?? "",
              location: config?.location ?? "",
              bio: config?.bio ?? "",
              availability: config?.availability ?? "",
              currentRole: config?.currentRole ?? "",
              tools: config?.tools ?? "",
              aboutHtml: config?.aboutHtml ?? "",
            }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Personal & social links</h2>
        <p className="mt-1 text-sm text-muted">
          GitHub, LinkedIn, mail, and anything else — add or remove freely. The
          platform controls which icon shows.
        </p>
        <div className="mt-4">
          <SocialLinksManager links={links} />
        </div>
      </div>
    </div>
  );
}
