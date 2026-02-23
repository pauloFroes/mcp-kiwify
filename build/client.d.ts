export declare class KiwifyApiError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function apiRequest<T>(endpoint: string, method?: "GET" | "POST" | "PUT" | "DELETE", body?: Record<string, unknown>, queryParams?: Record<string, string | undefined>): Promise<T>;
export declare function toolResult(data: unknown): {
    content: {
        type: "text";
        text: string;
    }[];
};
export declare function toolError(message: string): {
    isError: true;
    content: {
        type: "text";
        text: string;
    }[];
};
