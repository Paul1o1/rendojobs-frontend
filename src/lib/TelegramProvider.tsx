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

    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
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
  return (
    <>
      <EnhancedDebugger />
      {children}
    </>
  );
}

function EnhancedDebugger() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const getDebugInfo = () => {
      if (typeof window !== "undefined") {
        if (!window.Telegram || !window.Telegram.WebApp) {
          return { status: "No window.Telegram.WebApp object" };
        }
        const webApp = window.Telegram.WebApp as any;
        return {
          status: webApp.initData
            ? "initData Present"
            : "initData is EMPTY or missing",
          initData: webApp.initData,
          initDataUnsafe: webApp.initDataUnsafe,
          version: webApp.version,
          platform: webApp.platform,
          colorScheme: webApp.colorScheme,
          themeParams: webApp.themeParams,
          isExpanded: webApp.isExpanded,
          viewportHeight: webApp.viewportHeight,
          viewportStableHeight: webApp.viewportStableHeight,
          headerColor: webApp.headerColor,
          backgroundColor: webApp.backgroundColor,
          isClosingConfirmationEnabled: webApp.isClosingConfirmationEnabled,
        };
      }
      return { status: "window object not found" };
    };

    const timer = setTimeout(() => {
      setDebugInfo(getDebugInfo());
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!debugInfo) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 9999,
        fontSize: "12px",
        maxWidth: "90%",
        maxHeight: "40vh",
        overflow: "auto",
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}
