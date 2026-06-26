import "server-only";

type EnvSource = Record<string, string | undefined>;

function pick(source: EnvSource, key: string) {
  return source[key]?.trim() || undefined;
}

export function buildSocialProviders(source: EnvSource) {
  const socialProviders: {
    google?: { clientId: string; clientSecret: string };
    github?: { clientId: string; clientSecret: string };
  } = {};

  const googleId = pick(source, "GOOGLE_CLIENT_ID");
  const googleSecret = pick(source, "GOOGLE_CLIENT_SECRET");
  if (googleId && googleSecret) {
    socialProviders.google = { clientId: googleId, clientSecret: googleSecret };
  }

  const githubId = pick(source, "GITHUB_CLIENT_ID");
  const githubSecret = pick(source, "GITHUB_CLIENT_SECRET");
  if (githubId && githubSecret) {
    socialProviders.github = { clientId: githubId, clientSecret: githubSecret };
  }

  return Object.keys(socialProviders).length > 0 ? socialProviders : undefined;
}

export function getOAuthProviderFlags(source: EnvSource) {
  return {
    google: !!(pick(source, "GOOGLE_CLIENT_ID") && pick(source, "GOOGLE_CLIENT_SECRET")),
    github: !!(pick(source, "GITHUB_CLIENT_ID") && pick(source, "GITHUB_CLIENT_SECRET")),
  };
}

export async function readAuthEnvSource(): Promise<EnvSource> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return { ...process.env, ...(env as EnvSource) };
  } catch {
    return process.env as EnvSource;
  }
}
