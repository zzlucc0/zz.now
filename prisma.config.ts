declare const process: { env: Record<string, string | undefined> };

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.PRISMA_GENERATE_DATABASE_URL ||
  'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma v7 requires datasource URL here (NOT in schema.prisma)
    url: databaseUrl,
  },
};
