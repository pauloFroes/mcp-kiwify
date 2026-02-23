import { getToken, ACCOUNT_ID } from "./auth.js";
const BASE_URL = "https://public-api.kiwify.com/v1";
export class KiwifyApiError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "KiwifyApiError";
    }
}
export async function apiRequest(endpoint, method = "GET", body, queryParams) {
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
        if (qs)
            url += `?${qs}`;
    }
    const response = await fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            "x-kiwify-account-id": ACCOUNT_ID,
            ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status === 204) {
        return {};
    }
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        const msg = error.message || response.statusText;
        if (response.status === 429) {
            throw new KiwifyApiError(429, "Rate limit exceeded (100 req/min). Try again in a moment.");
        }
        throw new KiwifyApiError(response.status, `Kiwify API error (${response.status}): ${msg}`);
    }
    return (await response.json());
}
export function toolResult(data) {
    return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
}
export function toolError(message) {
    return {
        isError: true,
        content: [{ type: "text", text: message }],
    };
}
