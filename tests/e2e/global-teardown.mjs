import { rm } from "node:fs/promises";

export default async function globalTeardown() {
  if (process.env.E2E_TARGET !== "staging") {
    await rm(".playwright-data", { recursive: true, force: true });
  }
}
