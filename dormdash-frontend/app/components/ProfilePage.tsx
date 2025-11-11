import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";

type ProfilePageProps = {
  // optionally,  pass user data as props
};

export default function ProfilePage({}: ProfilePageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<"rider" | "driver">("rider");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    // TODO: send profile data to backend
    Alert.alert(
      "Profile Saved",
      `Name: ${fullName}\nEmail: ${email}\nRole: ${role}\nDescription: ${description}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      <Pressable onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: "#fff" }}>Select Profile Image</Text>
          </View>
        )}
      </Pressable>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Short Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <View style={styles.roleContainer}>
        <Pressable
          style={[styles.roleButton, role === "rider" && styles.activeRole]}
          onPress={() => setRole("rider")}
        >
          <Text style={role === "rider" ? styles.activeRoleText : styles.roleText}>Rider</Text>
        </Pressable>

        <Pressable
          style={[styles.roleButton, role === "driver" && styles.activeRole]}
          onPress={() => setRole("driver")}
        >
          <Text style={role === "driver" ? styles.activeRoleText : styles.roleText}>Driver</Text>
        </Pressable>
      </View>

      <Button title="Save Profile" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 20,
  },
  imagePlaceholder: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  roleButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  activeRole: {
    backgroundColor: "#ff6b6b",
    borderColor: "#ff6b6b",
  },
  roleText: { color: "#000" },
  activeRoleText: { color: "#fff", fontWeight: "bold" },
});
