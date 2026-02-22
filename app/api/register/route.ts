import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecretkey"; // fallback for dev

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phoneNumber, password } = body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    return NextResponse.json({
      success: true,
      message: "User created successfully!",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    }, { status: 201 });

  } catch (err: any) {
    console.error("REGISTER API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phoneNumber: true }
    });
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error("GET USERS API ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}