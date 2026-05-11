"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./home.module.css";
import ScapeMap from "@/components/Map";
import { dummySpots } from "@/lib/dummyData";

export default function Home() {
  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  return (
    <main className={styles.main}>
      <header className={`glass-panel ${styles.header}`}>
        <h1>SCAPE</h1>
        <nav>
          <Link href="/login" className="btn-primary">Login</Link>
        </nav>
      </header>
      
      <div className={styles.content}>
        <div className={`glass-panel ${styles.mapContainer}`}>
          <ScapeMap 
            spots={dummySpots} 
            selectedSpot={selectedSpot}
            onSpotClick={(spot: any) => setSelectedSpot(spot)} 
          />
        </div>

        <div className={styles.spotCarousel}>
          {dummySpots.map((spot) => (
            <div 
              key={spot.id} 
              className={`${styles.spotCard} ${selectedSpot?.id === spot.id ? styles.selected : ''}`}
              onClick={() => setSelectedSpot(spot)}
            >
              <img src={spot.imageUrl} alt={spot.name} className={styles.spotImage} />
              <div className={styles.spotInfo}>
                <h3>{spot.name}</h3>
                <p>{spot.description}</p>
                {selectedSpot?.id === spot.id && (
                  <Link href={`/spot/${spot.id}`} className={`btn-primary`} style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.8rem', padding: '8px 16px' }}>
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
