import { Button } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
import { Login, TokenAuth } from "../utils/auth"; // Assuming this utility exists
import GuestView from './components/guestView'
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
  const [isLoginView, setIsLoginView] = useState(false); // New state to control view
  const router = useRouter();
  const local = useLocalSearchParams();

  // Renamed to ensure auto-login check only runs once or when the view changes
  useEffect(() => {
    async function TryLogin() {
      //if a user has already logged in, we do not need to show them the FAQ
      // will show FAQ if a user has not logged in
      await TokenAuth(()=>{
        router.push({ pathname: "/mainView"})
      }) 
    }
    TryLogin();
  });
  const handleLogin = async () => {
    if (!email || !passHash) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }
    await Login(
      email,
      passHash,
      () => router.push({ pathname: "/mainView", params: { email } }),
      (message: string) => Alert.alert("Login Failed", message || "Invalid email or password")
    );
  };

  // Function to switch from Guest View to Login View
  const goToLogin = () => setIsLoginView(true);

  if (!isLoginView) {
    return <GuestView onGoToLogin={goToLogin} />;
  }

  // Original Login/Signup View
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginBottom: "80%" }}>
      <Text style={loginStyle.title}>Login</Text>
      <EmailInput defaultValue={local.email as string} onEmailChange={setEmail} />
      <PasswordInput onPassChange={setPassHash} />
      <Text>
        Forgot password? Click{" "}
        <Link href={{ pathname: "/forgot-password", params: { email } }}>here</Link>
      </Text>
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Button style={loginStyle.button} onPress={handleLogin}>
          Login
        </Button>
        <Button
          style={loginStyle.button}
          onPress={() => router.push({ pathname: "/signUp", params: { email } })}
        >
          Sign up
        </Button>
      </View>
      {/* Option to return to guest view */}
      <Button style={{ marginTop: 20 }} onPress={() => setIsLoginView(false)}>
        Back to Preview
      </Button>
    </View>
  );
}