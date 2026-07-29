import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, computeSessionToken, isCorrectPassword } from "@/lib/auth";

const schema = z.object({ password: z.string().min(1) });

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Wachtwoord ontbreekt" }, { status: 400 });
  }

  let correct: boolean;
  try {
    correct = isCorrectPassword(parsed.data.password);
  } catch {
    return NextResponse.json(
      { error: "Server is niet correct geconfigureerd (APP_PASSWORD ontbreekt)" },
      { status: 500 }
    );
  }

  if (!correct) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, computeSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
  return response;
}
