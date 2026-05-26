import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Compass, Calendar, User as UserIcon, ArrowLeft } from "lucide-react";
import styles from "./blog.module.css";

export default async function BlogDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      author: {
        select: { name: true, image: true }
      }
    }
  });

  if (!blog) {
    notFound();
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(blog.createdAt).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <main className={styles.container}>
      <header className={`glass-panel ${styles.header}`}>
        <div className={styles.logoArea}>
          <Compass className={styles.logoIcon} size={28} />
          <h1>SCAPE</h1>
        </div>
        <nav>
          <Link href="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </nav>
      </header>

      <article className={`glass-panel ${styles.blogContent}`}>
        <div className={styles.imageWrapper}>
          <img src={blog.imageUrl} alt={blog.title} className={styles.blogImage} />
        </div>

        <div className={styles.blogBody}>
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <UserIcon size={18} style={{ color: 'var(--primary-dark-green)' }} />
              <span>Posted by <strong>{blog.author?.name || "Explorer"}</strong></span>
            </div>
            <div className={styles.metaItem}>
              <Calendar size={18} style={{ color: 'var(--primary-dark-green)' }} />
              <span>{formattedDate} at {formattedTime}</span>
            </div>
          </div>

          <h1 className={styles.blogTitle}>{blog.title}</h1>
          
          <div className={styles.description}>
            {blog.description.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </article>
    </main>
  );
}
