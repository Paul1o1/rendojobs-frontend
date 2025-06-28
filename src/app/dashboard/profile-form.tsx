"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateUserProfile } from "./actions";

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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  image: z
    .any()
    .refine(
      (files) => !files?.[0] || files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (files) => !files?.[0] || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    )
    .optional(),
  phoneNumber: z
    .string()
    .max(20, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(100, "Location is too long.")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(160, "Bio is too long.").optional().or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url("Please enter a valid URL.")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileForm({
  user,
}: {
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    phoneNumber: string | null;
    location: string | null;
    bio: string | null;
    portfolioUrl: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    profileComplete: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEditMode, setIsEditMode] = useState(!user.profileComplete);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      location: user.location || "",
      bio: user.bio || "",
      portfolioUrl: user.portfolioUrl || "",
      linkedinUrl: user.linkedinUrl || "",
      githubUrl: user.githubUrl || "",
    },
    mode: "onChange",
  });

  const [preview, setPreview] = useState<string | null>(user.image);

  function onSubmit(data: ProfileFormValues) {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        if (key === "image" && value instanceof FileList) {
          if (value.length > 0) {
            formData.append(key, value[0]);
          }
        } else {
          formData.append(key, value as string);
        }
      }
    });

    startTransition(async () => {
      const result = await updateUserProfile(user.id, formData);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setIsEditMode(false);
      } else {
        toast.error(result.message);
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            form.setError(key as keyof ProfileFormValues, {
              type: "manual",
              message: (value as string[]).join(", "),
            });
          });
        }
      }
    });
  }

  const handleCancel = () => {
    form.reset({
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      location: user.location || "",
      bio: user.bio || "",
      portfolioUrl: user.portfolioUrl || "",
      linkedinUrl: user.linkedinUrl || "",
      githubUrl: user.githubUrl || "",
    });
    setPreview(user.image);
    setIsEditMode(false);
  };

  const imageRef = form.register("image");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <fieldset
          disabled={!isEditMode}
          className="space-y-8 disabled:cursor-not-allowed"
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Profile Picture</FormLabel>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={preview ?? undefined} />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <FormControl>
                    <Input
                      type="file"
                      {...imageRef}
                      onChange={(e) => {
                        field.onChange(e.target.files);
                        if (e.target.files?.[0]) {
                          setPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Upload a picture for your profile.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description of your professional background.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          <h3 className="text-lg font-medium">Contact Information</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled />
              <p className="text-sm text-muted-foreground">
                Your email address is not editable.
              </p>
            </div>
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1 234 567 890"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="San Francisco, CA"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <h3 className="text-lg font-medium">Online Presence</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="portfolioUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://your-portfolio.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://linkedin.com/in/your-profile"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="githubUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/your-username"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        <div className="flex justify-end gap-4">
          {isEditMode ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditMode(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
