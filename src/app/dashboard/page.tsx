"use client";

import * as React from "react";
import { useEffect, useState } from "react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://rendojobs-backend.onrender.com";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }
    const cacheBust = `&t=${new Date().getTime()}`;
    fetch(`${BACKEND_URL}/api/protected?${cacheBust}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          setError(data.error || "Unknown error");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch user info");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground">
            This is your dashboard. You are authenticated!
          </p>
        </header>
        <pre className="bg-muted p-4 rounded">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
