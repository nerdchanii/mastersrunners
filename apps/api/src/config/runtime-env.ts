import type { ConfigService } from "@nestjs/config";

type OAuthCallbackContract = {
  callbackEnv: "GOOGLE_CALLBACK_URL" | "KAKAO_CALLBACK_URL" | "NAVER_CALLBACK_URL";
  clientIdEnv: "GOOGLE_CLIENT_ID" | "KAKAO_CLIENT_ID" | "NAVER_CLIENT_ID";
};

const oauthCallbackContracts: OAuthCallbackContract[] = [
  { clientIdEnv: "KAKAO_CLIENT_ID", callbackEnv: "KAKAO_CALLBACK_URL" },
  { clientIdEnv: "GOOGLE_CLIENT_ID", callbackEnv: "GOOGLE_CALLBACK_URL" },
  { clientIdEnv: "NAVER_CLIENT_ID", callbackEnv: "NAVER_CALLBACK_URL" },
];

function readConfigValue(config: ConfigService, key: string) {
  return config.get<string>(key)?.trim() || "";
}

function assertAbsoluteHttpUrl(key: string, value: string) {
  if (!value) {
    throw new Error(`Missing required production environment variable: ${key}`);
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Environment variable ${key} must be an absolute http(s) URL in production.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Environment variable ${key} must be an absolute http(s) URL in production.`);
  }
}

export function validateProductionRuntimeEnv(config: ConfigService) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  assertAbsoluteHttpUrl("FRONTEND_URL", readConfigValue(config, "FRONTEND_URL"));

  for (const { clientIdEnv, callbackEnv } of oauthCallbackContracts) {
    if (!process.env[clientIdEnv]?.trim()) {
      continue;
    }

    assertAbsoluteHttpUrl(callbackEnv, readConfigValue(config, callbackEnv));
  }
}
