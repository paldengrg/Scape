"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Step tracking: 1 = Email entry, 2 = Security question & Password reset
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Check if email exists and fetch security question
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(errorText || "Email address not found");
      } else {
        const data = await res.json();
        setSecurityQuestion(data.securityQuestion);
        setStep(2);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Validate security answer and reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          securityAnswer,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(errorText || "Failed to reset password");
      } else {
        setSuccess("Password reset successful! Redirecting you to login...");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={`glass-panel ${styles.authCard}`}>
        <div>
          <h2>Reset Password</h2>
          <p>Retrieve access to your Scape account</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div 
            style={{
              color: "#2e7d32",
              background: "#edf7ed",
              padding: "12px",
              borderRadius: "8px",
              fontSize: "0.9rem",
              textAlign: "center",
              marginBottom: "8px"
            }}
          >
            {success}
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Ask for Email */
          <form onSubmit={handleCheckEmail} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className={`btn-primary ${styles.submitBtn}`}
              disabled={isLoading}
            >
              {isLoading ? "Checking email..." : "Continue"}
            </button>
          </form>
        ) : (
          /* Step 2: Security Question Verification & Reset */
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div 
              style={{
                background: "rgba(255, 255, 255, 0.4)",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                marginBottom: "8px"
              }}
            >
              <span style={{ fontSize: "0.85rem", color: "var(--primary-dark-green)", fontWeight: 600 }}>
                Security Question:
              </span>
              <p style={{ margin: "4px 0 0 0", textAlign: "left", fontSize: "1rem", color: "var(--text-dark)" }}>
                {securityQuestion}
              </p>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="securityAnswer">Your Answer</label>
              <input
                id="securityAnswer"
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
                placeholder="Type your answer here"
                disabled={isLoading || !!success}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={isLoading || !!success}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                disabled={isLoading || !!success}
              />
            </div>

            <button
              type="submit"
              className={`btn-primary ${styles.submitBtn}`}
              disabled={isLoading || !!success}
            >
              {isLoading ? "Resetting password..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p>
            Remembered your password? <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
