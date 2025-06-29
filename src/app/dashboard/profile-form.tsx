"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "./actions";
import { users } from "@/db/schema"; // Import the type from the schema

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Pencil } from "lucide-react";

// Simplified schema for now
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Use the exact user type from our Drizzle schema
type User = typeof users.$inferSelect;

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // A user's profile is incomplete if they don't have a name.
  const isProfileIncomplete = !user.name;
  const [isEditMode, setIsEditMode] = useState(isProfileIncomplete);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
    },
    mode: "onChange",
  });

  function onSubmit(data: ProfileFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);

    // We will re-add file uploads later

    startTransition(async () => {
      // The action now only needs the formData
      const result = await updateUserProfile(formData);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setIsEditMode(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  const handleCancel = () => {
    form.reset({ name: user.name || "" });
    setIsEditMode(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset
          disabled={!isEditMode}
          className="space-y-8 disabled:cursor-not-allowed"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Email</FormLabel>
            <Input value={user.email ?? ""} disabled />
            <FormDescription>
              Your email address is not editable.
            </FormDescription>
          </div>
        </fieldset>

        <div className="flex justify-end gap-4 mt-8">
          {isEditMode ? (
            <>
              {!isProfileIncomplete && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditMode(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
