"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [tab, setTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Effect to handle the manual Telegram Login Widget
  useEffect(() => {
    // This function will be called by the Telegram widget on successful login
    (window as any).onTelegramAuth = (user: any) => {
      setLoading(true);
      setError("");
      fetch("/api/telegram-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.token) {
            localStorage.setItem("jwt", data.token);
            window.location.href = "/dashboard";
          } else {
            setError(data.error || "Login failed");
            setLoading(false);
          }
        })
        .catch(() => {
          setError("An unexpected error occurred.");
          setLoading(false);
        });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    // IMPORTANT: Replace with your bot's username
    script.setAttribute("data-telegram-login", "rendojobsbot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "6");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const placeholder = document.getElementById("telegram-login-container");
    if (placeholder) {
      placeholder.innerHTML = "";
      placeholder.appendChild(script);
    }

    return () => {
      if ((window as any).onTelegramAuth) {
        delete (window as any).onTelegramAuth;
      }
    };
  }, []);

  // Placeholder submit handlers
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Implement email login logic
    setTimeout(() => {
      setError("Email login is not yet implemented.");
      setLoading(false);
    }, 1000);
  };
  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Implement phone login logic
    setTimeout(() => {
      setError("Phone login is not yet implemented.");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <Input type="email" placeholder="Email" required />
                <Input type="password" placeholder="Password" required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && tab === "email"
                    ? "Loading..."
                    : "Sign in with Email"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <Input type="tel" placeholder="Phone number" required />
                <Input type="text" placeholder="OTP" required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && tab === "phone"
                    ? "Loading..."
                    : "Sign in with Phone"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <Separator className="my-6" />
          <div
            id="telegram-login-container"
            className="w-full flex items-center justify-center"
          />
          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
