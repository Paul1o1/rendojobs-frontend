"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { db } from "@/db/drizzle";
import { user as users } from "@/db/schema";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  image: z
    .any()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
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
  bio: z.string().max(500, "Bio is too long.").optional().or(z.literal("")),
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

type ProfileFormValues = z.infer<typeof updateProfileSchema>;

export async function updateUserProfile(userId: string, formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    const rawFormData = Object.fromEntries(formData.entries());
    const image =
      rawFormData.image instanceof File && rawFormData.image.size > 0
        ? rawFormData.image
        : undefined;

    const validatedFields = updateProfileSchema.safeParse({
      ...rawFormData,
      image,
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { ...dataToUpdate } = validatedFields.data;
    delete (dataToUpdate as any).image;

    let imageUrl: string | undefined = undefined;

    if (image) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
      const filePath = `${userId}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, image, {
          upsert: true,
        });

      if (uploadError) {
        throw new Error("Failed to upload image.");
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      imageUrl = urlData.publicUrl;
    }

    await db
      .update(users)
      .set({
        ...dataToUpdate,
        ...(imageUrl && { image: imageUrl }),
        profileComplete: true,
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard");
    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update profile." };
  }
}
