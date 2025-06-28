import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Briefcase, CheckCircle, Bookmark, User, XCircle } from "lucide-react";

import { db } from "../../db/drizzle";
import { user as users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "./profile-form";

// Dummy data for job listings - replace with actual data fetching
const recommendedJobs = [
  {
    title: "Senior Frontend Developer",
    company: "Stripe",
    location: "Remote",
    tags: ["React", "TypeScript", "Next.js"],
  },
  {
    title: "Full Stack Engineer",
    company: "Vercel",
    location: "San Francisco, CA",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
  },
];

const shortlistedJobs = [
  {
    title: "Product Designer",
    company: "Figma",
    location: "New York, NY",
    tags: ["UI/UX", "Figma", "Prototyping"],
  },
];

// A reusable component for displaying a job card
const JobCard = ({
  title,
  company,
  location,
  tags,
}: {
  title: string;
  company: string;
  location: string;
  tags: string[];
}) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {company} - {location}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth");
  }

  const [fullUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!fullUser) {
    // This case might happen if a user is deleted but their session still exists.
    redirect("/auth");
  }

  const isProfileComplete = fullUser.profileComplete;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Job Seeker Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your applications and profile.
          </p>
        </header>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-4">
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="recommended" disabled={!isProfileComplete}>
              <Briefcase className="mr-2 h-4 w-4" /> Recommended
            </TabsTrigger>
            <TabsTrigger value="shortlisted" disabled={!isProfileComplete}>
              <Bookmark className="mr-2 h-4 w-4" /> Shortlisted
            </TabsTrigger>
            <TabsTrigger value="accepted" disabled={!isProfileComplete}>
              <CheckCircle className="mr-2 h-4 w-4" /> Accepted
            </TabsTrigger>
            <TabsTrigger value="rejected" disabled={!isProfileComplete}>
              <XCircle className="mr-2 h-4 w-4" /> Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  {!isProfileComplete
                    ? "Welcome! Please complete your profile to unlock all features."
                    : "This is how employers will see you. Keep it up to date."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProfileForm user={fullUser} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommended">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>
                  Jobs we think you'd be a great fit for.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedJobs.map((job, index) => (
                  <JobCard key={index} {...job} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortlisted">
            <Card>
              <CardHeader>
                <CardTitle>Shortlisted Jobs</CardTitle>
                <CardDescription>Jobs you've saved for later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {shortlistedJobs.map((job, index) => (
                  <JobCard key={index} {...job} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accepted">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Offers</CardTitle>
                <CardDescription>
                  Congratulations on your offers!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>No accepted offers to show right now.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Archived Applications</CardTitle>
                <CardDescription>
                  Applications that were not successful.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>No rejected applications to show.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
