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
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    setToken(storedToken);

    if (!storedToken) {
      setError("Not authenticated: No JWT found in localStorage.");
      setLoading(false);
      return;
    }

    const cacheBust = `t=${new Date().getTime()}`;
    fetch(`${BACKEND_URL}/api/user-profile?${cacheBust}`, {
      headers: {
        Authorization: `Bearer ${storedToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch user data. Status: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          setError(
            `Backend error: ${data.error || "Unknown error from server"}`
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(`Client-side fetch error: ${err.message}`);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/ping`)
      .then((res) => res.json())
      .then((data) => {
        alert("Backend says: " + JSON.stringify(data));
      })
      .catch((err) => {
        alert("Failed to reach backend: " + err.message);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-red-500 font-bold">Error</h1>
        <p>{error}</p>
        <h2 className="mt-4 font-bold">Token Used:</h2>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            backgroundColor: "#f0f0f0",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          {token || "No token"}
        </pre>
      </div>
    );
  }

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
