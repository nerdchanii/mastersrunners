type UploadRuntimeEnv = NodeJS.ProcessEnv;

export function resolveR2Endpoint(env: UploadRuntimeEnv): string {
  const explicitEndpoint = env.R2_ENDPOINT?.trim();
  if (explicitEndpoint) {
    return explicitEndpoint.replace(/\/$/, "");
  }

  const accountId = env.R2_ACCOUNT_ID?.trim();
  if (!accountId) {
    return "";
  }

  return `https://${accountId}.r2.cloudflarestorage.com`;
}

export function hasR2RuntimeConfig(env: UploadRuntimeEnv): boolean {
  return Boolean(
    env.R2_ACCESS_KEY_ID?.trim() && env.R2_SECRET_ACCESS_KEY?.trim() && resolveR2Endpoint(env),
  );
}
