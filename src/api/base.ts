export const BASE_URL = "http://192.168.1.7:3000/api";

interface FetchOptions {
  params?: Record<string, string | number | undefined>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export class ApiError extends Error {
  public status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const getToken = async (): Promise<string> => {
  const { getAuth } = await import("firebase/auth");
  const { initializeApp } = await import("firebase/app");
  const { getIdToken } = await import("firebase/auth");

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const user = auth.currentUser;

  if (!user) {
    throw new ApiError(401, "User not authenticated");
  }

  return await getIdToken(user);
};

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<ApiResponse<T>> {
  const { params } = options;

  const queryString = params
    ? "?" + new URLSearchParams(params as Record<string, string>).toString()
    : "";

  const url = `${BASE_URL}${endpoint}${queryString}`;

  try {
    const token = await getToken();
    console.log(token);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Network error occurred");
  }
}

export async function fetchApiNoAuth<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return await response.json();
}
