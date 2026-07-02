import fs from "node:fs";
import path from "node:path";

function extractGoogleClientId(payload) {
  return payload?.web?.client_id || payload?.installed?.client_id || payload?.client_id || "";
}

function readEnvValue(key) {
  for (const fileName of [".env.local", ".env"]) {
    const envPath = path.join(process.cwd(), fileName);

    if (!fs.existsSync(envPath)) {
      continue;
    }

    const line = fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith(`${key}=`));

    if (line) {
      return line.split("=").slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }

  return "";
}

function readGoogleClientIdFromJson() {
  const candidateDirs = [process.cwd(), path.resolve(process.cwd(), "..")];
  const explicitPath = process.env.GOOGLE_OAUTH_CLIENT_JSON;

  if (explicitPath && fs.existsSync(explicitPath)) {
    return extractGoogleClientId(JSON.parse(fs.readFileSync(explicitPath, "utf8")));
  }

  for (const dir of candidateDirs) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    const fileName = fs
      .readdirSync(dir)
      .find((name) => /^(google|client|oauth).*\.json$/i.test(name));

    if (fileName) {
      return extractGoogleClientId(
        JSON.parse(fs.readFileSync(path.join(dir, fileName), "utf8")),
      );
    }
  }

  return "";
}

const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  readEnvValue("NEXT_PUBLIC_GOOGLE_CLIENT_ID") ||
  readGoogleClientIdFromJson();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: googleClientId,
  },
};

export default nextConfig;
