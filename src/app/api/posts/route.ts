import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { auth } from "@/auth";
import { dummySpots } from "@/lib/dummyData";

const libsql = createClient({
  url: 'file:./dev.db',
})
const prismaAdapter = new PrismaLibSql(libsql)
const prisma = new PrismaClient({ adapter: prismaAdapter })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spotId = searchParams.get('spotId');

  try {
    const posts = await prisma.post.findMany({
      where: spotId ? { spotId } : undefined,
      include: {
        author: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("GET_POSTS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized. Please log in.", { status: 401 });
    }

    const body = await request.json();
    const { title, content, imageUrl, spotId } = body;

    if (!title || !content || !spotId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Ensure the spot exists in the database
    const dummySpot = dummySpots.find(s => s.id === spotId);
    if (!dummySpot) {
      return new NextResponse("Invalid Spot ID", { status: 400 });
    }

    await prisma.spot.upsert({
      where: { id: dummySpot.id },
      update: {},
      create: {
        id: dummySpot.id,
        name: dummySpot.name,
        description: dummySpot.description,
        latitude: dummySpot.latitude,
        longitude: dummySpot.longitude,
        imageUrl: dummySpot.imageUrl,
      }
    });

    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl,
        authorId: session.user.id,
        spotId
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("POST_CREATE_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
