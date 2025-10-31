import { Platform } from "react-native";

const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.66:5000";

const FALLBACK_BASE_URLS = Platform.select<string[]>({
  android: ["http://10.0.2.2:5000"],
  ios: ["http://127.0.0.1:5000"],
  default: ["http://localhost:5000"],
}) as string[];

const BASE_URL_CANDIDATES = Array.from(
  new Set([DEFAULT_BASE_URL, ...(FALLBACK_BASE_URLS ?? [])])
);

type ApiRequestOptions = RequestInit & { path: string };

/**
 * Tries each known base URL until a request succeeds.
 * Useful when switching between emulator (10.0.2.2) and physical devices (LAN IP).
 */
export async function apiRequest<T>({
  path,
  ...options
}: ApiRequestOptions): Promise<{ response: Response; baseUrl: string }> {
  let lastError: unknown;

  for (const baseUrl of BASE_URL_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      return { response, baseUrl };
    } catch (error) {
      lastError = error;

      // Only retry on network failures (fetch throws TypeError).
      if (!(error instanceof TypeError)) {
        break;
      }
    }
  }

  throw lastError ?? new Error("API request failed.");
}
