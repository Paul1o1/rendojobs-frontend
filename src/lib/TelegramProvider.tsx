"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// The URL for your Render backend. This should be an environment variable.
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://rendojobs-backend.onrender.com";

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [debugMessage, setDebugMessage] = useState("Initializing...");

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      setDebugMessage("JWT found. Logged in.");
      return;
    }

    // --- Build Debug Message ---
    let dbg = "Status: ";
    if (typeof window === "undefined") {
      dbg += "No window. ";
    } else if (!window.Telegram) {
      dbg += "No window.Telegram. ";
    } else if (!window.Telegram.WebApp) {
      dbg += "No window.Telegram.WebApp. ";
    } else if (!window.Telegram.WebApp.initData) {
      dbg += `initData is empty or missing. Length: ${
        window.Telegram.WebApp.initData?.length ?? "N/A"
      }. `;
    } else {
      dbg += "initData found! Attempting login...";
    }
    setDebugMessage(dbg);
    // --- End Build Debug Message ---

    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initData
    ) {
      const tgData = window.Telegram.WebApp.initData;

      fetch(`${BACKEND_URL}/api/telegram-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tgData }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            setDebugMessage("Login successful! Redirecting...");
            localStorage.setItem("jwt", data.token);
            router.push("/dashboard");
          } else {
            setDebugMessage(`Login failed: ${data.error}`);
            router.push("/login");
          }
        })
        .catch((err) => {
          setDebugMessage(`Fetch Error: ${err.message}`);
          router.push("/login");
        });
    } else {
      if (!pathname.startsWith("/role") && pathname !== "/") {
        router.push("/login");
      }
    }
  }, [pathname, router]);

  return (
    <>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          left: "10px",
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "white",
          padding: "8px",
          borderRadius: "5px",
          zIndex: 9999,
          fontSize: "11px",
          maxWidth: "calc(100% - 20px)",
          fontFamily: "monospace",
          pointerEvents: "none",
        }}
      >
        {debugMessage}
      </div>
    </>
  );
}
