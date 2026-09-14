-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "listStyle" TEXT NOT NULL DEFAULT 'card';

-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "headlineHighlight" TEXT,
ADD COLUMN     "avatarUrl" TEXT;

-- AlterTable
ALTER TABLE "SiteConfig" DROP COLUMN "defaultView";
