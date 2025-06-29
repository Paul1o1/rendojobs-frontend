"use client";

import * as React from "react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTelegramAutoLogin } from "@/lib/useTelegramAutoLogin";

export default function LoginPage() {
  useTelegramAutoLogin();

  const [tab, setTab] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Placeholder submit handlers
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Implement email login logic
    setTimeout(() => setLoading(false), 1000);
  };
  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // TODO: Implement phone login logic
    setTimeout(() => setLoading(false), 1000);
  };
  const handleTelegramLogin = () => {
    setLoading(true);
    setError("");
    // TODO: Implement Telegram login logic
    setTimeout(() => setLoading(false), 1000);
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
                  {loading ? "Loading..." : "Sign in with Email"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="phone">
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <Input type="tel" placeholder="Phone number" required />
                <Input type="text" placeholder="OTP" required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : "Sign in with Phone"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <Separator className="my-6" />
          <Button
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={handleTelegramLogin}
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              className="mr-2"
            >
              <path
                fill="currentColor"
                d="M21.944 3.685a1.5 1.5 0 0 0-1.64-.217L3.5 11.09a1.5 1.5 0 0 0 .13 2.77l3.97 1.47 1.47 4.01a1.5 1.5 0 0 0 2.77.13l7.62-16.8a1.5 1.5 0 0 0-.516-1.885zM9.5 17.5l-1.25-3.42 7.72-7.72-6.47 8.14-3.42-1.25 14.44-6.44-10.02 10.02z"
              />
            </svg>
            Sign in with Telegram
          </Button>
          {error && (
            <p className="mt-4 text-center text-sm text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
