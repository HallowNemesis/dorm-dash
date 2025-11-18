import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getProfile, updateProfile, deleteProfile, Logout } from "../../utils/auth";
import { useAuthUser } from "../../utils/useAuthUser";


type Role = "rider" | "driver";

type ProfilePageProps = {
  // optionally,  pass user data as props
};

export default function ProfilePage({ }: ProfilePageProps) {
  const router = useRouter();

  const { loading } = useAuthUser();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<Role>("rider");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { ok, data } = await getProfile();
      if (!ok || !data) return;
      setFullName(data.full_name ?? "");
      setBio(data.bio ?? "");
      setRole((data.role as Role) ?? "rider");
      setProfileImage(data.avatar_url ?? null);
      setEmail(data.email ?? "");
    }
    load();
  }, []);

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

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Name is required.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(
        {
          full_name: fullName,
          bio,
          avatar_url: profileImage,
          role,
        },
        () => Alert.alert("Profile Saved", "Your profile has been updated."),
        (msg) => Alert.alert("Save Failed", msg)
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

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

      {/* Email shown as read-only since backend doesn't update it here  */}
      <TextInput
        placeholder="Email"
        value={email}
        editable={false}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Short Description"
        value={bio}
        onChangeText={setBio}
        style={[styles.input, { height: 80 }]}
        multiline
      />

      <View style={styles.roleContainer}>
        <Pressable
          style={[styles.roleButton, role === "rider" && styles.activeRole]}
          onPress={() => setRole("rider")}
        >
          <Text
            style={role === "rider" ? styles.activeRoleText : styles.roleText}
          >
            Rider
          </Text>
        </Pressable>

        <Pressable
          style={[styles.roleButton, role === "driver" && styles.activeRole]}
          onPress={() => setRole("driver")}
        >
          <Text
            style={role === "driver" ? styles.activeRoleText : styles.roleText}
          >
            Driver
          </Text>
        </Pressable>
      </View>

      <Button
        title={saving ? "Saving..." : "Save Profile"}
        onPress={handleSave}
        disabled={saving}
      />
      <View style={{ marginTop: 20 }}>

        <View style={{ marginBottom: 20 }}>
          <Button
            title="Logout"
            color="#777"
            onPress={() => {
              Alert.alert(
                "Logout",
                "Are you sure you want to log out?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                      await Logout(() => {
                        router.replace("/signUp");
                      });
                    },
                  },
                ]
              );
            }}
          />
        </View>

        <View style={{ marginTop: 30, width: 150, height: 30, alignSelf: "center" }}>
          {/* Delete Account Button */}
          <Button
            title="Delete Account"
            color="#d9534f"
            onPress={() => {
              Alert.alert(
                "Delete Account",
                "Are you sure you want to permanently delete your account? This cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      deleteProfile(
                        async () => {
                          Alert.alert("Account Deleted", "Your account has been removed.");
                          await Logout(() => {
                            router.replace("/signUp");
                          });
                        },
                        (msg) => Alert.alert("Error", msg)
                      );
                    }
                  }
                ]
              );
            }}
          />
        </View>
      </View>
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
