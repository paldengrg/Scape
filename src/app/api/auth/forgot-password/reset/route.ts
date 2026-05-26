import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, securityAnswer, newPassword } = body;

    if (!email || !securityAnswer || !newPassword) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (!user.securityAnswer) {
      return new NextResponse("Security question not set up for this account", { status: 400 });
    }

    // Normalize the submitted answer: trim whitespace and convert to lowercase
    const normalizedAnswer = securityAnswer.trim().toLowerCase();

    // Verify security answer matches the stored hashed answer
    const isAnswerCorrect = await bcrypt.compare(normalizedAnswer, user.securityAnswer);

    if (!isAnswerCorrect) {
      return new NextResponse("Incorrect answer to the security question", { status: 400 });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in the database
    await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
