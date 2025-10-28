import { Button } from "@react-navigation/elements";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
import * as SecureStore from 'expo-secure-store'
import { Login } from "../utils/auth"; // Assuming this utility exists

// --- Start of New GuestView Component ---

const guestStyle = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: '#555',
  },
  faqItem: {
    marginBottom: 15,
  },
  faqQuestion: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007AFF', // A noticeable color for questions
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  }
});

function GuestView({ onGoToLogin }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={guestStyle.container}>
        <Text style={guestStyle.sectionTitle}>Welcome! 👋</Text>
        <Text style={guestStyle.content}>
          Explore how our community platform works before you join. This read-only view provides key information about safety, features, and guidelines.
        </Text>

        <Text style={guestStyle.sectionTitle}>How It Works</Text>
        <Text style={guestStyle.content}>
          Our platform connects users for safe, community-based sharing. Users can post requests or offers once registered. For your safety, all transactions are logged, and profiles are verified.
        </Text>

        <Text style={guestStyle.sectionTitle}>FAQ</Text>
        <View style={guestStyle.faqItem}>
          <Text style={guestStyle.faqQuestion}>Q: Can I request a ride as a guest?</Text>
          <Text style={guestStyle.content}>A: No. Ride-requesting and posting are only available after you log in or sign up.</Text>
        </View>
        <View style={guestStyle.faqItem}>
          <Text style={guestStyle.faqQuestion}>Q: How do I join the community?</Text>
          <Text style={guestStyle.content}>A: You can join by clicking the "Log In / Sign Up" button below to create your free account.</Text>
        </View>

        <Text style={guestStyle.sectionTitle}>Community Guidelines</Text>
        <Text style={guestStyle.content}>
          We are committed to a safe and respectful environment. By joining, you agree to:
        </Text>
        <Text style={guestStyle.content}>• Treat all members with respect.</Text>
        <Text style={guestStyle.content}>• Use the platform for its intended purpose only.</Text>
        <Text style={guestStyle.content}>• Report any suspicious or inappropriate activity immediately.</Text>
        
        <View style={{height: 50}} /> 
      </ScrollView>

      {/* Footer/Action area for guest */}
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc', flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button style={{backgroundColor: '#007AFF'}} onPress={onGoToLogin}>
          <Text style={{color: 'white'}}>Log In / Sign Up</Text>
        </Button>
      </View>
    </View>
  );
}

// --- End of New GuestView Component ---

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
      if (isLoginView === false) {
        // Only run auto-login check if we haven't already decided to show the login screen
        let email = await SecureStore.getItemAsync("email");
        if (!email) {
          return; // No stored email, stay on guest view
        }
        let password = await SecureStore.getItemAsync("password");
        if (!password) {
          return; // No stored password, stay on guest view
        }
        
        // Attempt auto-login with stored credentials
        await Login(
          email,
          password,
          () => router.push({ pathname: "/mainView", params: { email } }),
          (message: string) => {
            // Auto-login failed, transition to the login view
            Alert.alert("Auto-Login Failed", message || "Please log in manually.");
            setIsLoginView(true);
          }
        );
      }
    }
    TryLogin();
  }, [isLoginView]); // Depend on isLoginView to avoid unnecessary checks

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
        <Text>Back to Preview</Text>
      </Button>
    </View>
  );
}