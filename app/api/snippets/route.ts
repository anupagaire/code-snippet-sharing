import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// GET all snippets
export async function GET() {
  try {
    const snippetsRaw = await prisma.snippet.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: true, // now safe because relation is optional
      },
    });

    const snippets = snippetsRaw.map((s) => ({
      id: s.id,
      language: s.language,
      codeBlock: s.codeBlock,
      tags: s.tags,
      createdAt: s.createdAt.toISOString(), // better for frontend
      author: s.author?.name || "Anonymous",
    }));

    return NextResponse.json(snippets);
  } catch (err: any) {
    console.error("GET /api/snippets CRASH:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
    });
    return NextResponse.json(
      { error: "Failed to load snippets", details: err.message },
      { status: 500 }
    );
  }
}

// POST create new snippet
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload: any = verify(token, JWT_SECRET);

    if (!payload.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { language, codeBlock } = await request.json();
    if (!language || !codeBlock) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const snippet = await prisma.snippet.create({
      data: {
        language,
        codeBlock,
        author: { connect: { id: payload.id } },
        tags: [],
      },
    });

    return NextResponse.json(snippet);
  } catch (err: any) {
    console.error("POST /api/snippets error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}