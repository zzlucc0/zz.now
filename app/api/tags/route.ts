import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { z } from "zod";

// GET /api/tags - List all tags (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    
    const tags = await prisma.tag.findMany({
      where: search ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      } : {},
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { tags },
      error: null,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch tags",
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create a new tag (authenticated users only)
const createTagSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  slug: z.string().min(1).max(50).trim().regex(/^[a-z0-9-]+$/),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTagSchema.parse(body);

    // Check if tag with same name or slug already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: { equals: validatedData.name, mode: "insensitive" } },
          { slug: validatedData.slug },
        ],
      },
    });

    if (existingTag) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "TAG_EXISTS",
            message: "A tag with this name or slug already exists",
          },
        },
        { status: 409 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { tag },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid tag data",
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    console.error("Error creating tag:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create tag",
        },
      },
      { status: 500 }
    );
  }
}
