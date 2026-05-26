import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    let blogs = await prisma.blog.findMany({
      include: {
        author: {
          select: { name: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // If no blogs exist, auto-seed a couple of beautiful default blogs
    if (blogs.length === 0) {
      const user = await prisma.user.findFirst();
      if (user) {
        const dummyBlogs = [
          {
            title: "Exploring the Royal National Park Coastline",
            description: "If you are looking for an escape from the city, the coastal walk at Royal National Park is unmatched. From the beautiful sandstone cliffs to the secret swimming pools, it's a paradise. Be sure to bring plenty of water and a camera to capture the breathtaking lookouts!",
            imageUrl: "https://images.unsplash.com/photo-1615456209689-0b190f7dcc13?q=80&w=800&auto=format&fit=crop",
            authorId: user.id
          },
          {
            title: "A Scenic Escape: Manly to Spit Bridge Scenic Walk",
            description: "The Spit to Manly walk is one of the classic coastal walks in Sydney. Winding through sub-tropical rainforest, scenic bushland, and quiet sandy bays, it offers incredible views of Sydney Harbour. Stop at Clontarf beach for a quick dip or a coffee along the way.",
            imageUrl: "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=800&auto=format&fit=crop",
            authorId: user.id
          }
        ];

        // Bulk insert
        await prisma.blog.createMany({
          data: dummyBlogs
        });

        // Re-fetch
        blogs = await prisma.blog.findMany({
          include: {
            author: {
              select: { name: true, image: true }
            }
          },
          orderBy: { createdAt: "desc" }
        });
      }
    }

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("GET_BLOGS_ERROR", error);
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
    const { title, description, imageUrl } = body;

    if (!title || !description || !imageUrl) {
      return new NextResponse("Missing required fields (title, description, imageUrl)", { status: 400 });
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        description,
        imageUrl,
        authorId: session.user.id
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error("POST_BLOGS_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
