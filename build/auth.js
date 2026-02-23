const BASE_URL = "https://public-api.kiwify.com/v1";
function getRequiredEnv(name) {
    const value = process.env[name];
    if (!value) {
        console.error(`Error: Missing required environment variable: ${name}\n` +
            "  KIWIFY_CLIENT_ID, KIWIFY_CLIENT_SECRET, and KIWIFY_ACCOUNT_ID are required.\n" +
            "  Get your credentials at: kiwify.com.br → Apps → API → Create API Key");
        process.exit(1);
    }
    return value;
}
const CLIENT_ID = getRequiredEnv("KIWIFY_CLIENT_ID");
const CLIENT_SECRET = getRequiredEnv("KIWIFY_CLIENT_SECRET");
export const ACCOUNT_ID = getRequiredEnv("KIWIFY_ACCOUNT_ID");
let cachedToken = null;
let tokenExpiresAt = 0;
export async function getToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }
    const response = await fetch(`${BASE_URL}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(`OAuth token request failed (${response.status}): ${error.message || response.statusText}`);
    }
    const data = (await response.json());
    cachedToken = data.access_token;
    // Refresh 5 minutes before actual expiration
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
    console.error("Kiwify OAuth token acquired successfully");
    return cachedToken;
}
