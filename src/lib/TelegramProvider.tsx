"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function useTelegramAutoLogin() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("TelegramProvider: Hook started on path:", pathname);

    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      console.log("TelegramProvider: JWT found in localStorage. Skipping.");
      return;
    }

    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      console.log("TelegramProvider: On login/register page. Skipping.");
      return;
    }

    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initData
    ) {
      console.log("TelegramProvider: Telegram WebApp context found.");
      const tgData = window.Telegram.WebApp.initData;
      console.log("TelegramProvider: Sending initData to API.");

      fetch("/api/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData: tgData }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("TelegramProvider: Received response from API:", data);
          if (data.success && data.token) {
            console.log(
              "TelegramProvider: Login successful. Storing JWT and redirecting to /dashboard."
            );
            localStorage.setItem("jwt", data.token);
            router.push("/dashboard");
          } else {
            console.error(
              "TelegramProvider: API call failed or returned no token.",
              data.error
            );
            router.push("/login");
          }
        })
        .catch((err) => {
          console.error("TelegramProvider: Fetch failed.", err);
          router.push("/login");
        });
    } else {
      console.log(
        "TelegramProvider: Not in Telegram context and no JWT. Redirecting to login if necessary."
      );
      if (!jwt && !pathname.startsWith("/role") && pathname !== "/") {
        router.push("/login");
      }
    }
  }, [pathname, router]);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useTelegramAutoLogin();
  return <>{children}</>;
}
