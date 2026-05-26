import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return new NextResponse("Email address not found", { status: 404 });
    }

    if (!user.securityQuestion) {
      return new NextResponse(
        "No security question is configured for this account. Please contact support.",
        { status: 400 }
      );
    }

    return NextResponse.json({
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    console.error("VERIFY_EMAIL_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
