import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={`glass-panel ${styles.header}`}>
        <h1>SCAPE</h1>
        <nav>
          <a href="/login" className="btn-primary">Login</a>
        </nav>
      </header>
      
      <div className={styles.content}>
        <h2>Find Your Spot</h2>
        <p>Discover the best hiking trails and relaxation spots in Sydney.</p>
        <button className="btn-primary">Explore Map</button>
      </div>
    </main>
  );
}
