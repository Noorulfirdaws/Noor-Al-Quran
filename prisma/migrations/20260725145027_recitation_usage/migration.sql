-- CreateTable
CREATE TABLE "RecitationUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecitationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecitationUsage_userId_idx" ON "RecitationUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecitationUsage_userId_month_key" ON "RecitationUsage"("userId", "month");

-- AddForeignKey
ALTER TABLE "RecitationUsage" ADD CONSTRAINT "RecitationUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
