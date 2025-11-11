import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Alert } from "react-native";
import { Button } from "@react-navigation/elements";
import { useLocalSearchParams, Link } from "expo-router";
import { ConfirmResetPassword } from "../utils/auth";

const styles = StyleSheet.create({
  title: {
    fontSize: 36,
    fontWeight: "300",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: 250,
    marginVertical: 10,
  },
});

export default function ResetPasswordConfirmPage() {
  const params = useLocalSearchParams();
  const token = params.token as string;
  const email = params.email as string;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill out both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    ConfirmResetPassword(
      token,
      newPassword,
      () => {
        Alert.alert("Success", "Your password has been reset successfully!");
      },
      (msg) => {
        Alert.alert("Error", msg || "Failed to reset password.");
      }
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "80%",
      }}
    >
      <Text style={styles.title}>Set New Password</Text>
      <Text>Email: {email}</Text>

      <TextInput
        secureTextEntry
        placeholder="New Password"
        style={styles.input}
        onChangeText={setNewPassword}
        value={newPassword}
      />
      <TextInput
        secureTextEntry
        placeholder="Confirm Password"
        style={styles.input}
        onChangeText={setConfirmPassword}
        value={confirmPassword}
      />

      <Button onPress={handleSubmit}>Confirm Password Reset</Button>

      <Text>
        Back to{" "}
        <Link href={{ pathname: "/", params: { email } }}>Login</Link>
      </Text>
    </View>
  );
}
