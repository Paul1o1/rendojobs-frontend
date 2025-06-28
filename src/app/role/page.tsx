"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function RoleSelection() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          How are you planning to use our platform?
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Choose your role to get the tailored experience you need.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/auth" className="group">
          <Card className="h-full transform transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl">
                <span>I'm a Job Seeker</span>
                <ArrowRight className="h-6 w-6 transform transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </CardTitle>
              <CardDescription className="pt-2">
                I want to find my next career opportunity, set up my profile,
                and connect with employers.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/auth" className="group">
          <Card className="h-full transform transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl">
                <span>I'm an Employer</span>
                <ArrowRight className="h-6 w-6 transform transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </CardTitle>
              <CardDescription className="pt-2">
                I'm looking to hire talent, post job openings, and manage
                applications.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
