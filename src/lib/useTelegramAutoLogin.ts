import { useEffect } from "react";

declare global {
  interface Window {
    Telegram?: any;
  }
}

export function useTelegramAutoLogin() {
  useEffect(() => {
    // Check for Telegram WebApp context
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp &&
      window.Telegram.WebApp.initDataUnsafe &&
      window.Telegram.WebApp.initDataUnsafe.user
    ) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      // Send telegramUser to your backend for verification and login
      fetch("/api/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramUser),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            // Store JWT in localStorage
            localStorage.setItem("jwt", data.token);
            window.location.href = "/dashboard";
          }
        });
    }
  }, []);
}
