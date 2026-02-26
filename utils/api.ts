// utils/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../config";

export async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await AsyncStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found. Please log in again.");
  }

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`,
      ...options.headers, // allow overrides if needed
    },
  });
}

// Convenience wrappers so you don't have to pass method every time
export const api = {
  get: (path: string) =>
    authFetch(path, { method: "GET" }),

  post: (path: string, body: object) =>
    authFetch(path, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  patch: (path: string, body: object) =>
    authFetch(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (path: string) =>
    authFetch(path, { method: "DELETE" }),
};