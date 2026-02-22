import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  const snippets = await prisma.snippet.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(snippets);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload: any = verify(token, JWT_SECRET);

    const { language, codeBlock } = await request.json();
    if (!language || !codeBlock) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const snippet = await prisma.snippet.create({
      data: {
        language,
        codeBlock,
        author: payload.name || "Anonymous",
      },
    });

    return NextResponse.json(snippet);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}