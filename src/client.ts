import { getToken, ACCOUNT_ID } from "./auth.js";

const BASE_URL = "https://public-api.kiwify.com/v1";

export class KiwifyApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "KiwifyApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  queryParams?: Record<string, string | undefined>,
): Promise<T> {
  const token = await getToken();

  let url = `${BASE_URL}${endpoint}`;

  if (queryParams) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== "") {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "x-kiwify-account-id": ACCOUNT_ID!,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const msg = (error as Record<string, unknown>).message || response.statusText;

    if (response.status === 429) {
      throw new KiwifyApiError(429, "Rate limit exceeded (100 req/min). Try again in a moment.");
    }

    throw new KiwifyApiError(response.status, `Kiwify API error (${response.status}): ${msg}`);
  }

  return (await response.json()) as T;
}

export function toolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function toolError(message: string) {
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}
