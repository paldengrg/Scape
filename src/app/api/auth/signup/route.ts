import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, securityQuestion, securityAnswer } = body;

    if (!email || !name || !password || !securityQuestion || !securityAnswer) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email
      }
    });

    if (exist) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedAnswer = securityAnswer.trim().toLowerCase();
    const hashedAnswer = await bcrypt.hash(normalizedAnswer, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        securityQuestion,
        securityAnswer: hashedAnswer
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("SIGNUP_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
