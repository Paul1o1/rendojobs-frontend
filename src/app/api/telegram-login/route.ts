import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateTelegramData } from "@/lib/telegram-provider";
import jwt from "jsonwebtoken";

// This should be an environment variable
const TELEGRAM_BOT_TOKEN = "8197448307:AAH-LuSpHEa3Fl8HhgHos3Tl45W7cJgpIew";
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { initData } = body;

    if (!initData) {
      return NextResponse.json(
        { success: false, error: "Missing initData" },
        { status: 400 }
      );
    }

    const userData = validateTelegramData(initData, TELEGRAM_BOT_TOKEN);

    if (!userData) {
      return NextResponse.json(
        { success: false, error: "Invalid Telegram data" },
        { status: 403 }
      );
    }

    const { id: telegram_id, first_name, last_name } = userData;

    let user;

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.telegram_id, telegram_id.toString()))
      .limit(1);

    if (userResult.length === 0) {
      // Auto-register the user if they don't exist
      const newUser = await db
        .insert(users)
        .values({
          telegram_id: telegram_id.toString(),
          name: [first_name, last_name].filter(Boolean).join(" ") || "New User",
        })
        .returning();

      if (newUser.length === 0) {
        return NextResponse.json(
          { success: false, error: "Failed to create new user" },
          { status: 500 }
        );
      }
      user = newUser[0];
    } else {
      user = userResult[0];
    }

    // User is validated, create a JWT
    const token = jwt.sign(
      {
        id: user.id,
        telegram_id: user.telegram_id,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    return NextResponse.json({ success: true, token });
  } catch (error) {
    console.error("Telegram login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
