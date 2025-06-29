"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function useTelegramAutoLogin() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      // If user is already authenticated, no need to run the logic.
      // You might want to add a check here to validate the JWT with the backend.
      return;
    }

    // Only run this logic if we're not already on the login/register pages
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

      fetch("/api/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tgData }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem("jwt", data.token);
            router.push("/dashboard");
          } else {
            // If auth fails, redirect to login.
            // This prevents non-Telegram users from getting stuck.
            router.push("/login");
          }
        })
        .catch(() => {
          router.push("/login");
        });
    } else {
      // If not in Telegram context and no JWT, redirect to login
      if (!pathname.startsWith("/role") && pathname !== "/") {
        router.push("/login");
      }
    }
  }, [pathname, router]);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useTelegramAutoLogin();
  return <>{children}</>;
}
