import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootDirectory = resolve(serverDirectory, "..");
const envPaths = [
  resolve(process.cwd(), ".env"),
  resolve(serverDirectory, ".env"),
  resolve(serverDirectory, ".env.server"),
  resolve(rootDirectory, ".env"),
  resolve(rootDirectory, ".env.server")
];

for (const path of new Set(envPaths)) {
  dotenv.config({ path });
  if (process.env.MONGODB_URI) break;
}
