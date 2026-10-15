import "dotenv/config";

export function requireApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Missing API KEY");
  }

  return key;
}
