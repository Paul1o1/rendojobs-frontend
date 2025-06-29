import { createHmac, timingSafeEqual } from "crypto";

type TelegramUserData = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

export function validateTelegramData(
  initData: string,
  botToken: string
): TelegramUserData | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\\n");

  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const calculatedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (!timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(hash))) {
    return null;
  }

  const userJson = params.get("user");
  if (!userJson) return null;

  try {
    const user = JSON.parse(userJson) as TelegramUserData;
    return user;
  } catch (e) {
    return null;
  }
}
