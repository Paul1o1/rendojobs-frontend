"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground animate-fadeIn">
      <div className="text-center p-8 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-slideUp">
          Ready to Start Your Career?
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slideUp delay-200">
          Let's begin by setting up your profile to connect you with the best
          opportunities.
        </p>
        <div className="animate-slideUp delay-400">
          <Button
            asChild
            size="lg"
            className="transition-transform duration-300 ease-in-out hover:scale-105"
          >
            <Link href="/role">Set Up Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
