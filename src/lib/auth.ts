import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "planner_session";
const SESSION_MESSAGE = "planner-session";

function requireAppPassword(): string {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    throw new Error(
      "APP_PASSWORD is niet ingesteld. Zet deze environment variabele om de app te gebruiken."
    );
  }
  return password;
}

export function computeSessionToken(): string {
  return createHmac("sha256", requireAppPassword()).update(SESSION_MESSAGE).digest("hex");
}

export function isCorrectPassword(candidate: string): boolean {
  const expected = requireAppPassword();
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = computeSessionToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
