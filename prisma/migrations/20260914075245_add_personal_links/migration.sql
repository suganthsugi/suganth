-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN     "email" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "ownerName" TEXT;

-- CreateTable
CREATE TABLE "SocialLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'link',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialLink_order_idx" ON "SocialLink"("order");
