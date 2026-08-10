import { prisma } from '../src/config/database';

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Opportunity" 
      ADD COLUMN IF NOT EXISTS "externalId" TEXT, 
      ADD COLUMN IF NOT EXISTS "source" TEXT, 
      ADD COLUMN IF NOT EXISTS "companyLogo" TEXT, 
      ADD COLUMN IF NOT EXISTS "remote" BOOLEAN NOT NULL DEFAULT false, 
      ADD COLUMN IF NOT EXISTS "salaryMin" DOUBLE PRECISION, 
      ADD COLUMN IF NOT EXISTS "salaryMax" DOUBLE PRECISION, 
      ADD COLUMN IF NOT EXISTS "salaryCurrency" TEXT, 
      ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);
    `);
    
    // Add unique constraint only if it doesn't exist
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'Opportunity_source_externalId_key'
        ) THEN
            ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_source_externalId_key" UNIQUE ("source", "externalId");
        END IF;
      END
      $$;
    `);
    
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main().finally(() => prisma.$disconnect());
