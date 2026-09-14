import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const config = await prisma.siteConfig.findUnique({
    where: { id: "singleton" },
  });

  return (
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
          }}
        />
      </div>
    </div>
  );
}
