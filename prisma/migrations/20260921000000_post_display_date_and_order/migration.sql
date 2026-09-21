-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "displayDate" TIMESTAMP(3),
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Post_order_idx" ON "Post"("order");
