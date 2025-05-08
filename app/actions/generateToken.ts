"use server";

import { cookies } from "next/headers";

export async function generateToken() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/external-login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "user@example.com",
        name: "Fake User",
      }),
    },
  );

  const data = await response.json();

  if (data.token) {
    cookies().set("apiToken", data.token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return data;
}
