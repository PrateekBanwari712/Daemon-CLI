import "dotenv/config"

export function requireApiKey(): string {
  const key = process.env.GOOGLE_GEMINI_API;
  if (!key) {
    throw new Error("Missing API KEY");
  }

  return key;
}
