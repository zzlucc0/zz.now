export default {
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma v7 requires datasource URL here (NOT in schema.prisma)
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@db:5432/personal_platform",
  },
};
