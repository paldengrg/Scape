"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { dummySpots } from "@/lib/dummyData";
import styles from "./spot.module.css";
import { MapPin, Navigation } from "lucide-react";

export default function SpotDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const spot = dummySpots.find(s => s.id === id);

  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  
  // Community Posts State
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await fetch(`/api/posts?spotId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [id]);

  useEffect(() => {
    // Get user's current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // If we have both user location and spot location, fetch route
    if (userLocation && spot) {
      const fetchRoute = async () => {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${spot.longitude},${spot.latitude}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            setRouteGeoJSON(data.routes[0].geometry);
          }
        } catch (error) {
          console.error("Failed to fetch route", error);
        }
      };
      fetchRoute();
    }
  }, [userLocation, spot]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl, spotId: id }),
      });

      if (!res.ok) {
        const errText = await res.text();
        setError(errText || "Failed to create post. Are you logged in?");
      } else {
        setTitle("");
        setContent("");
        setImageUrl("");
        fetchPosts(); // Refresh posts
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!spot) return <div className={styles.container}>Spot not found</div>;

  const osmStyle: any = {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap Contributors',
      }
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 22 }]
  };

  return (
    <main className={styles.container}>
      <header className={`glass-panel ${styles.header}`}>
        <h1>SCAPE</h1>
        <nav>
          <Link href="/" className="btn-primary">Back to Map</Link>
        </nav>
      </header>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img src={spot.imageUrl} alt={spot.name} />
        </div>

        <div className={`glass-panel ${styles.infoSection}`}>
          <h2>{spot.name}</h2>
          <p>{spot.description}</p>
          
          <div style={{ marginTop: 'auto' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--primary-dark-green)', display: 'flex', alignItems: 'center' }}>
              <Navigation size={20} style={{ marginRight: '8px' }}/>
              Route to Spot
            </h3>
            <div className={styles.mapSection}>
              <Map
                initialViewState={{
                  longitude: spot.longitude,
                  latitude: spot.latitude,
                  zoom: 11
                }}
                mapStyle={osmStyle}
                mapLib={maplibregl}
              >
                <NavigationControl position="top-right" />
                
                <Marker longitude={spot.longitude} latitude={spot.latitude} anchor="bottom">
                  <MapPin color="var(--primary-dark-green)" fill="white" size={32} />
                </Marker>

                {userLocation && (
                  <Marker longitude={userLocation.lng} latitude={userLocation.lat} anchor="bottom">
                    <div style={{ width: 16, height: 16, background: 'var(--light-blue)', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }} />
                  </Marker>
                )}

                {routeGeoJSON && (
                  <Source id="route" type="geojson" data={routeGeoJSON}>
                    <Layer
                      id="route"
                      type="line"
                      source="route"
                      layout={{
                        'line-join': 'round',
                        'line-cap': 'round'
                      }}
                      paint={{
                        'line-color': '#A3C4D3',
                        'line-width': 5,
                        'line-opacity': 0.9
                      }}
                    />
                  </Source>
                )}
              </Map>
            </div>
            {!userLocation && <p style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.7 }}>Please allow location access to see the route from your current position.</p>}
          </div>
        </div>

        {/* Community Section */}
        <div className={`glass-panel ${styles.communitySection}`}>
          <h2>Community Posts</h2>
          
          <form onSubmit={handlePostSubmit} className={styles.postForm}>
            <h3>Share your experience</h3>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <input 
              type="text" 
              placeholder="Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
            />
            <textarea 
              placeholder="Write your review or blog post here..." 
              rows={4}
              value={content} 
              onChange={e => setContent(e.target.value)} 
              required 
            />
            <input 
              type="url" 
              placeholder="Photo URL (Optional)" 
              value={imageUrl} 
              onChange={e => setImageUrl(e.target.value)} 
            />
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post"}
            </button>
          </form>

          <div className={styles.postList}>
            {posts.length === 0 ? (
              <p>No posts yet. Be the first to share your experience!</p>
            ) : (
              posts.map(post => (
                <div key={post.id} className={styles.postCard}>
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post image" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} />
                  )}
                  <div className={styles.postMeta}>
                    Posted by {post.author?.name || 'Anonymous'} on {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
