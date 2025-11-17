import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import jwt_decode from "jwt-decode";

type DecodedToken = {
  id: number;
  email: string;
  role?: "rider" | "driver";
  exp?: number;
};

export function useAuthUser() {
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<"rider" | "driver" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadToken() {
      const token = await SecureStore.getItemAsync("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded: DecodedToken = jwt_decode(token);

        setUserId(decoded.id);
        setEmail(decoded.email);
        setRole(decoded.role ?? "rider");
      } catch (err) {
        console.log("Invalid token:", err);
        await SecureStore.deleteItemAsync("token");
      }

      setLoading(false);
    }

    loadToken();
  }, []);

  return { userId, email, role, loading };
}
