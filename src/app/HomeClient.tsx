"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import styles from "./home.module.css";
import ScapeMap from "@/components/Map";
import { 
  Heart, 
  Search, 
  MapPin, 
  TreePine, 
  ArrowRight, 
  Mail, 
  Compass, 
  Sparkles,
  Users,
  CheckCircle
} from "lucide-react";

// Inline brand SVGs since brand icons are removed in newer Lucide versions
const Instagram = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Facebook = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Twitter = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

interface Spot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
}

interface HomeClientProps {
  session: any;
  dummySpots: Spot[];
}

export default function ScapeHomeClient({ session, dummySpots }: HomeClientProps) {
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Load favorites from LocalStorage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem("scape_favorites");
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedFavs = [...favorites];
    if (favorites.includes(id)) {
      updatedFavs = updatedFavs.filter(favId => favId !== id);
    } else {
      updatedFavs.push(id);
    }
    setFavorites(updatedFavs);
    localStorage.setItem("scape_favorites", JSON.stringify(updatedFavs));
  };

  // Filter spots based on search query
  const filteredSpots = dummySpots.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get favorited spot objects
  const favoritedSpotsList = dummySpots.filter(spot => favorites.includes(spot.id));

  // Handle newsletter submit
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  // Blog states
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogImagePreview, setBlogImagePreview] = useState<string | null>(null);
  const [blogImageUrl, setBlogImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);
  const [blogError, setBlogError] = useState("");

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBlogImageFile(file);
    setBlogImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    setBlogError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/blogs/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await res.json();
      setBlogImageUrl(data.url);
    } catch (err: any) {
      setBlogError(err.message || "Image upload failed");
      setBlogImagePreview(null);
      setBlogImageFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogDescription.trim() || !blogImageUrl) {
      setBlogError("Please fill out all fields and upload an image.");
      return;
    }

    setIsSubmittingBlog(true);
    setBlogError("");

    try {
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: blogTitle,
          description: blogDescription,
          imageUrl: blogImageUrl,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create blog post");
      }

      // Reset form
      setBlogTitle("");
      setBlogDescription("");
      setBlogImageFile(null);
      setBlogImagePreview(null);
      setBlogImageUrl(null);
      setIsFormOpen(false);

      // Refresh blogs list
      fetchBlogs();
    } catch (err: any) {
      setBlogError(err.message || "An error occurred.");
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBlogImageFile(null);
    setBlogImagePreview(null);
    setBlogImageUrl(null);
  };

  return (
    <main className={styles.main}>
      {/* 1. Transparent Header / Navigation */}
      <header className={`glass-panel ${styles.header}`}>
        <div className={styles.logoArea}>
          <Compass className={styles.logoIcon} size={28} />
          <h1>SCAPE</h1>
        </div>
        <nav className={styles.navLinks}>
          <a href="#explore">Explore</a>
          <a href="#favorites">Favorites</a>
          {session && <a href="#blogs">Blogs</a>}
          <a href="#about">About</a>
          <a href="#socials">Socials</a>
        </nav>
        <div className={styles.authArea}>
          {session ? (
            <div className={styles.userInfo}>
              <span className={styles.userName}>Hello, {session.user?.name || "Explorer"}</span>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn-primary"
                style={{ background: "rgba(220, 53, 69, 0.8)", padding: "8px 16px", fontSize: "0.9rem" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary">Sign In</Link>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>
              <Sparkles size={14} style={{ marginRight: "6px" }} /> Rediscover Nature
            </span>
            <h2>Find Your Next Escape</h2>
            <p>
              Discover curated hiking trails, quiet forest spots, panoramic lookouts, and calming beach walk terrains in and around Sydney.
            </p>
            
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                placeholder="Search spots by name or keyword..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <a href="#explore" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "16px" }}>
              Start Exploring <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Explore & Interactive Map Section */}
      <section id="explore" className={styles.exploreSection}>
        <div className={styles.sectionHeader}>
          <h2>Explore Scenic Terrain</h2>
          <p>Select a spot to view coordinates, description, and get driving directions.</p>
        </div>

        <div className={styles.contentLayout}>
          {/* List of Spots */}
          <div className={styles.spotsSidebar}>
            {filteredSpots.length === 0 ? (
              <div className={styles.noSpots}>
                <p>No spots found matching your search. Try another keyword!</p>
              </div>
            ) : (
              filteredSpots.map((spot) => (
                <div 
                  key={spot.id} 
                  className={`${styles.spotListItem} ${selectedSpot?.id === spot.id ? styles.selectedItem : ''}`}
                  onClick={() => setSelectedSpot(spot)}
                >
                  <img src={spot.imageUrl} alt={spot.name} className={styles.listItemImage} />
                  <div className={styles.listItemInfo}>
                    <div className={styles.listItemHeader}>
                      <h3>{spot.name}</h3>
                      <button 
                        onClick={(e) => toggleFavorite(spot.id, e)} 
                        className={`${styles.favBtn} ${favorites.includes(spot.id) ? styles.isFav : ""}`}
                      >
                        <Heart size={18} fill={favorites.includes(spot.id) ? "var(--light-blue)" : "none"} />
                      </button>
                    </div>
                    <p>{spot.description}</p>
                    <div className={styles.listItemMeta}>
                      <span className={styles.coordinates}>
                        <MapPin size={12} style={{ marginRight: "4px" }} />
                        {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                      </span>
                      {selectedSpot?.id === spot.id && (
                        <Link href={`/spot/${spot.id}`} className={styles.detailsLink}>
                          View Details & Routes <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Interactive Map */}
          <div className={`glass-panel ${styles.mapContainer}`}>
            <ScapeMap 
              spots={filteredSpots} 
              selectedSpot={selectedSpot}
              onSpotClick={(spot: Spot) => setSelectedSpot(spot)} 
            />
          </div>
        </div>
      </section>

      {/* 4. Favorites Section */}
      <section id="favorites" className={styles.favoritesSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Saved Escapes</h2>
          <p>Keep track of the spots you plan to visit next.</p>
        </div>

        {favoritedSpotsList.length === 0 ? (
          <div className={`glass-panel ${styles.emptyFavorites}`}>
            <Heart size={48} className={styles.heartIconAnim} />
            <h3>No favorites saved yet</h3>
            <p>Browse spots above and click the heart icon to save your favorite landscapes here.</p>
          </div>
        ) : (
          <div className={styles.favoritesGrid}>
            {favoritedSpotsList.map(spot => (
              <div key={spot.id} className={`glass-panel ${styles.favCard}`}>
                <div className={styles.favCardImageContainer}>
                  <img src={spot.imageUrl} alt={spot.name} />
                  <button 
                    onClick={(e) => toggleFavorite(spot.id, e)}
                    className={styles.favCardHeart}
                  >
                    <Heart size={20} fill="var(--light-blue)" color="var(--light-blue)" />
                  </button>
                </div>
                <div className={styles.favCardContent}>
                  <h3>{spot.name}</h3>
                  <p>{spot.description}</p>
                  <Link href={`/spot/${spot.id}`} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem", width: "100%", textAlign: "center", display: "block", marginTop: "12px" }}>
                    View Route & Reviews
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4.5 Blogs Section */}
      <section id="blogs" className={styles.blogsSection}>
        <div className={styles.blogsHeaderArea}>
          <div className={styles.sectionHeader}>
            <h2>Nature Blogs & Stories</h2>
            <p>Discover experiences, guides, and stories shared by Sydney outdoor enthusiasts.</p>
          </div>
          {session && (
            <button 
              className={styles.uploadBlogBtn}
              onClick={() => setIsFormOpen(!isFormOpen)}
            >
              <Sparkles size={16} style={{ marginRight: "6px" }} /> {isFormOpen ? "Cancel" : "Upload Blog"}
            </button>
          )}
        </div>

        {isFormOpen && session && (
          <div className={styles.blogFormContainer}>
            <form onSubmit={handleBlogSubmit} className={styles.blogForm}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--primary-dark-green)" }}>Share Your Adventure</h3>
              {blogError && <div style={{ color: "red", fontSize: "0.9rem", marginBottom: "10px" }}>{blogError}</div>}
              
              <div className={styles.formRow}>
                <label htmlFor="blog-title">Title</label>
                <input 
                  id="blog-title"
                  type="text"
                  placeholder="Give your blog a catchy title..."
                  value={blogTitle}
                  onChange={e => setBlogTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label htmlFor="blog-description">Description</label>
                <textarea 
                  id="blog-description"
                  placeholder="Write your experience, tips, and guidelines..."
                  rows={5}
                  value={blogDescription}
                  onChange={e => setBlogDescription(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <label>Blog Picture</label>
                {blogImagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img src={blogImagePreview} alt="Blog preview" />
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className={styles.removeImageBtn}
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label className={styles.fileUploadArea}>
                    <TreePine className={styles.uploadIcon} size={28} />
                    <span className={styles.uploadText}>
                      {isUploading ? "Uploading..." : "Click to select a picture"}
                    </span>
                    <span className={styles.uploadHint}>Supports JPG, PNG, GIF files</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => {
                    setIsFormOpen(false);
                    setBlogError("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isUploading || isSubmittingBlog || !blogImageUrl}
                >
                  {isSubmittingBlog ? "Posting..." : "Post Blog"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.blogsGrid}>
          {blogs.length === 0 ? (
            <div className={`glass-panel ${styles.emptyFavorites}`} style={{ width: "100%", gridColumn: "1 / -1" }}>
              <h3>No blog posts yet</h3>
              <p>Be the first to share your experience by logging in and posting a blog!</p>
            </div>
          ) : (
            blogs.map((blog) => (
              <Link href={`/blog/${blog.id}`} key={blog.id} className={styles.blogCard}>
                <div className={styles.blogCardImageContainer}>
                  <img src={blog.imageUrl} alt={blog.title} />
                </div>
                <div className={styles.blogCardContent}>
                  <h3>{blog.title}</h3>
                  <p className={styles.blogCardDescription}>{blog.description}</p>
                  <div className={styles.blogCardMeta}>
                    <span className={styles.blogCardAuthor}>
                      By {blog.author?.name || "Explorer"}
                    </span>
                    <span className={styles.blogCardDate}>
                      {new Date(blog.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* 5. About Section */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutText}>
            <h2>About Scape</h2>
            <p className={styles.lead}>
              Scape was created for urban explorers seeking peace in nature. We catalog Sydney's finest coastal paths, deep forest reservations, and panoramic cliffside terrain.
            </p>
            
            <div className={styles.highlights}>
              <div className={styles.highlightItem}>
                <TreePine className={styles.highlightIcon} />
                <div>
                  <h4>Curated Trails</h4>
                  <p>Hand-picked spots cataloged with coordinates, descriptions, and trail photos.</p>
                </div>
              </div>
              <div className={styles.highlightItem}>
                <Compass className={styles.highlightIcon} />
                <div>
                  <h4>Live Navigation & Driving Routes</h4>
                  <p>Get instant turn-by-turn routing from your current coordinates using open-source maps.</p>
                </div>
              </div>
              <div className={styles.highlightItem}>
                <Users className={styles.highlightIcon} />
                <div>
                  <h4>Community Driven</h4>
                  <p>Share your experiences, write guides, upload travel photos and review spots.</p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.aboutImageContainer}>
            <div className={styles.aboutImageWrapper}>
              <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=800&auto=format&fit=crop" alt="Forest walkway" />
              <div className={styles.aboutImageBadge}>
                <h4>15+ Curated Regions</h4>
                <p>Across Greater Sydney</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Socials/Community Feed Section */}
      <section id="socials" className={styles.socialsSection}>
        <div className={styles.sectionHeader}>
          <h2>#ScapeSydney Feed</h2>
          <p>Check out latest photos and adventures shared by our community of explorers.</p>
        </div>
        
        <div className={styles.socialsGrid}>
          {[
            { url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=400&auto=format&fit=crop", caption: "Deep in the canopy" },
            { url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop", caption: "Sunrays hitting the forest walk" },
            { url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=400&auto=format&fit=crop", caption: "Mountain range lookouts" },
            { url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop", caption: "Sydney coastal borders" },
            { url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop", caption: "Quiet moss paths" },
            { url: "https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=400&auto=format&fit=crop", caption: "Evening sunsets by the cliffs" }
          ].map((feed, index) => (
            <div key={index} className={styles.socialCard}>
              <img src={feed.url} alt={feed.caption} />
              <div className={styles.socialCardOverlay}>
                <Instagram size={24} color="white" />
                <p>{feed.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Premium Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerMain}>
            <div className={styles.footerBrand}>
              <div className={styles.logoArea} style={{ padding: 0 }}>
                <Compass className={styles.logoIcon} size={28} />
                <h2 style={{ letterSpacing: "2px", color: "var(--white)" }}>SCAPE</h2>
              </div>
              <p>Discover relaxing nature reserves, coastal walks, and hiking terrain in Greater Sydney.</p>
              <div className={styles.socialIcons}>
                <a href="#"><Instagram size={20} /></a>
                <a href="#"><Facebook size={20} /></a>
                <a href="#"><Twitter size={20} /></a>
              </div>
            </div>
            
            <div className={styles.footerLinks}>
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#explore">Explore Terrain</a></li>
                <li><a href="#favorites">Favorites</a></li>
                <li><a href="#about">About Scape</a></li>
                <li><a href="#socials">Community Socials</a></li>
              </ul>
            </div>
            
            <div className={styles.footerContact}>
              <h3>Contact Us</h3>
              <p>Email: contact@scape.com</p>
              <p>Location: Sydney, NSW, Australia</p>
            </div>
            
            <div className={styles.footerNewsletter}>
              <h3>Newsletter</h3>
              <p>Subscribe to receive updates on new curated hiking paths and scenic escapes.</p>
              {subscribed ? (
                <div className={styles.newsletterSuccess}>
                  <CheckCircle size={16} /> Subscribed successfully!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    required
                  />
                  <button type="submit">
                    <Mail size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <p>&copy; {new Date().getFullYear()} Scape. All rights reserved. Designed for Sydney Outdoor Lovers.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
