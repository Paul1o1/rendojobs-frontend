"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://rendojobs-backend.onrender.com";

export function useTelegramAutoLogin() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      return;
    }

    // Give the Telegram script a moment to initialize
    setTimeout(() => {
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
          .then((res) => {
            if (!res.ok) {
              res.json().then((err) => console.error("API Error:", err));
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
          .then((data) => {
            if (data.success && data.token) {
              localStorage.setItem("jwt", data.token);
              router.push("/dashboard");
            } else {
              router.push("/login");
            }
          })
          .catch((err) => {
            console.error("Fetch failed:", err);
            router.push("/login");
          });
      } else {
        if (pathname.startsWith("/dashboard")) {
          router.push("/login");
        }
      }
    }, 100); // 100ms delay
  }, [pathname, router]);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useTelegramAutoLogin();
  return <>{children}</>;
}
