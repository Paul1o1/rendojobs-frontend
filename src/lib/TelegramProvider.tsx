"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://rendojobs-backend.onrender.com";

function DebugDisplay({ status, data }: { status: string; data: any }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        left: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 9999,
        fontSize: "12px",
        maxWidth: "90%",
      }}
    >
      <p>Status: {status}</p>
      {data && <pre>Data: {JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export function useTelegramAutoLogin(
  setStatus: (status: string) => void,
  setData: (data: any) => void
) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setStatus("Checking JWT...");
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      setStatus("JWT found. Redirecting to dashboard.");
      router.push("/dashboard");
      return;
    }
    setStatus("No JWT found.");

    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      setStatus(`On ${pathname}, skipping login.`);
      return;
    }

    setStatus("Waiting for Telegram script...");
    setTimeout(() => {
      if (
        typeof window !== "undefined" &&
        window.Telegram &&
        window.Telegram.WebApp
      ) {
        if (window.Telegram.WebApp.initData) {
          setStatus("initData found. Calling backend...");
          const tgData = window.Telegram.WebApp.initData;

          fetch(`${BACKEND_URL}/api/telegram-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData: tgData }),
          })
            .then((res) => {
              if (!res.ok) {
                setStatus(`API Error: ${res.status}`);
                res.json().then((err) => setData(err));
                throw new Error(`HTTP error! status: ${res.status}`);
              }
              setStatus("API response OK. Parsing JSON...");
              return res.json();
            })
            .then((data) => {
              setData(data);
              if (data.success && data.token) {
                setStatus("Token received. Storing JWT...");
                localStorage.setItem("jwt", data.token);
                router.push("/dashboard");
              } else {
                setStatus(
                  "Backend responded with failure. Redirecting to login."
                );
                router.push("/login");
              }
            })
            .catch((err) => {
              setStatus("Fetch failed.");
              setData({ message: err.message, stack: err.stack });
              router.push("/login");
            });
        } else {
          setStatus("initData is empty or not present.");
          if (pathname.startsWith("/dashboard")) {
            router.push("/login");
          }
        }
      } else {
        setStatus("No window.Telegram.WebApp object.");
        if (pathname.startsWith("/dashboard")) {
          router.push("/login");
        }
      }
    }, 500); // Increased delay to 500ms
  }, [pathname, router, setStatus, setData]);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState("Initializing...");
  const [data, setData] = useState<any>(null);
  useTelegramAutoLogin(setStatus, setData);

  return (
    <>
      <DebugDisplay status={status} data={data} />
      {children}
    </>
  );
}
