export function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Set it in .env.local (see .env.example).`
    );
  }
  return value;
}
