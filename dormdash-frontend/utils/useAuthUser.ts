// utils/useAuthUser.ts
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ??
  "https://dawn-youthful-disrespectfully.ngrok-free.dev/api";

type Role = "rider" | "driver";

type UserState = {
  userId: number | null;
  email: string | null;
  role: Role | null;
  loading: boolean;
};

function decodeJwt(token: string): { id?: number; email?: string } {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8")
    );
    return decoded;
  } catch {
    return {};
  }
}

export function useAuthUser(): UserState {
  const [state, setState] = useState<UserState>({
    userId: null,
    email: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
          if (isMounted)
            setState({ userId: null, email: null, role: null, loading: false });
          return;
        }

        const decoded = decodeJwt(token);
        const userId = decoded.id ?? null;
        const email = decoded.email ?? null;

        // fetch profile to get role
        const response = await fetch(`${API_BASE}/profile/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let role: Role | null = null;
        if (response.ok) {
          const profile = await response.json();
          role = profile.role as Role;
        }

        if (isMounted) {
          setState({ userId, email, role, loading: false });
        }
      } catch (err) {
        console.error("useAuthUser error:", err);
        if (isMounted) {
          setState({ userId: null, email: null, role: null, loading: false });
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
