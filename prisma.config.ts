declare const process: { env: Record<string, string | undefined> };

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export default {
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma v7 requires datasource URL here (NOT in schema.prisma)
    url: databaseUrl,
  },
};
