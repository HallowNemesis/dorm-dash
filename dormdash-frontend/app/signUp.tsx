import { Button } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
import { Login, TokenAuth } from "../utils/auth";
import GuestView from "./components/guestView";

const loginStyle = StyleSheet.create({
  title: {
    fontSize: 50,
    fontWeight: "100",
  },
  button: {
    margin: 10,
  },
});

export default function Index() {
  const [email, setEmail] = useState("");
  const [passHash, setPassHash] = useState("");
  const [isLoginView, setIsLoginView] = useState(false);
  const router = useRouter();
  const local = useLocalSearchParams();

  // Auto-login check: run ONLY once when component mounts
  useEffect(() => {
    async function tryLogin() {
      await TokenAuth(() => {
        router.push({ pathname: "/mainView" });
      });
    }

    tryLogin();
  }, [router]);

  const handleLogin = async () => {
    if (!email || !passHash) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    await Login(
      email,
      passHash,
      () => router.push({ pathname: "/mainView", params: { email } }),
      (message?: string) =>
        Alert.alert("Login Failed", message || "Invalid email or password")
    );
  };

  const goToLogin = () => setIsLoginView(true);

  if (!isLoginView) {
    return <GuestView onGoToLogin={goToLogin} />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "80%",
      }}
    >
      <Text style={loginStyle.title}>Login</Text>

      <EmailInput
        defaultValue={(local.email as string) || ""}
        onEmailChange={setEmail}
      />

      <PasswordInput onPassChange={setPassHash} />

      <Text>
        Forgot password? Click{" "}
        <Link href={{ pathname: "/forgotPassword", params: { email } }}>
          here
        </Link>
      </Text>

      <View style={{ flexDirection: "row" }}>
        <Button style={loginStyle.button} onPress={handleLogin}>
          Login
        </Button>
        <Button
          style={loginStyle.button}
          onPress={() =>
            router.push({ pathname: "/signUp", params: { email } })
          }
        >
          Sign up
        </Button>
      </View>

      <Button style={{ marginTop: 20 }} onPress={() => setIsLoginView(false)}>
        Back to Preview
      </Button>
    </View>
  );
}
