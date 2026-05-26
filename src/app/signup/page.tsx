"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/login.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("What was the name of your first pet?");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          securityQuestion,
          securityAnswer
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(errorText || "Something went wrong");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={`glass-panel ${styles.authCard}`}>
        <div>
          <h2>Create Account</h2>
          <p>Join Scape and find your spot</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="securityQuestion">Security Question</label>
            <select
              id="securityQuestion"
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
              required
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                background: "rgba(255, 255, 255, 0.8)",
                fontSize: "1rem",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                outline: "none",
                cursor: "pointer",
                color: "var(--text-dark)"
              }}
            >
              <option value="What was the name of your first pet?">What was the name of your first pet?</option>
              <option value="In what city or town were you born?">In what city or town were you born?</option>
              <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
              <option value="What was the name of your first school?">What was the name of your first school?</option>
              <option value="What is your favorite book or movie?">What is your favorite book or movie?</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="securityAnswer">Security Answer</label>
            <input
              id="securityAnswer"
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              required
              placeholder="Your answer"
            />
          </div>
          <button 
            type="submit" 
            className={`btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
