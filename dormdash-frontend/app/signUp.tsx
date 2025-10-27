import { Button } from "@react-navigation/elements";
import { useState } from "react";
import { Text, View, StyleSheet, Alert, TextInput } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import EmailInput from "./components/emailInput";
import PasswordInput from "./components/passwordInput";
import inputStyle from "./components/input-style";
import { CreateAcc } from "./utils/auth";

// ngrok tunnel URL for backend API 
const API_BASE = "https://dawn-youthful-disrespectfully.ngrok-free.dev/api/auth";

const loginStyle = StyleSheet.create({
  title: {
    fontSize: 50,
    fontWeight: "100",
  },
});

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passHash, setPassHash] = useState("");
  const [confirmPassHash, setConfirmPassHash] = useState("");
  const router = useRouter();
  const local = useLocalSearchParams();

  const handleSignUp = async () => {
    if (!name || !email || !passHash || !confirmPassHash) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (passHash !== confirmPassHash) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    await CreateAcc(name,email,passHash,()=>{
        Alert.alert("Sign Up Success", "Account created successfully");
        router.push({ pathname: "/", params: { email } });
    },
  (message)=>{
      Alert.alert(
          "Sign Up Failed",
          message || "Unable to sign up with the provided credentials"
        );
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "80%",
      }}
    >
      <Text style={loginStyle.title}>Sign Up</Text>
      <TextInput
        style={inputStyle().input}
        placeholder="Full Name"
        onChangeText={setName}
        value={name}
      />
      <EmailInput defaultValue={local.email as string} onEmailChange={setEmail} />
      <PasswordInput onPassChange={setPassHash} />
      <PasswordInput onPassChange={setConfirmPassHash} />
      <Text>
        Nevermind! Take me{" "}
        <Link href={{ pathname: "/", params: { email } }}>Back</Link>
      </Text>
      <Button onPress={handleSignUp}>Sign Up</Button>
    </View>
  );
}
