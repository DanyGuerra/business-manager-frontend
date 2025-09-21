const NESTJS_URL = process.env.API_BUSINESS_URL;

export async function proxyFetch(path: string, options: RequestInit) {
  const res = await fetch(`${NESTJS_URL}/business${path}`, options);
  const data = await res.json();
  return { status: res.status, data };
}
