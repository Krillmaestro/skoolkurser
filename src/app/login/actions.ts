"use server";

import { cookies } from "next/headers";

export async function verifyPin(pin: string): Promise<{ success: boolean }> {
  const sitePin = process.env.SITE_PIN;

  if (!sitePin) {
    console.error("SITE_PIN environment variable is not set");
    return { success: false };
  }

  if (pin === sitePin) {
    const cookieStore = await cookies();
    cookieStore.set("pin-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return { success: true };
  }

  return { success: false };
}
