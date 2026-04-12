-- DropForeignKey
ALTER TABLE "FeatureVote" DROP CONSTRAINT "FeatureVote_featureId_fkey";

-- DropForeignKey
ALTER TABLE "FeatureVote" DROP CONSTRAINT "FeatureVote_userId_fkey";

-- AlterTable
ALTER TABLE "ParcelRequest" ADD COLUMN     "declaredValueAed" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "FeatureIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureVote" ADD CONSTRAINT "FeatureVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
