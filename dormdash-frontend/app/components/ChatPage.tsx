import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getSocket } from "../../utils/socket";

type Message = {
  id: string;
  text: string;
  sender: string; // rider or driver
  rideId: number;
};

type ChatPageProps = {
  rideId: number | null;
};

export default function ChatPage({ rideId }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");


  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    // Listen for messages for THIS ride only
    socket.on("newChatMessage", (msg: Message) => {
      if (msg.rideId === rideId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("newChatMessage");
      setMessages([]);
    };
  }, [rideId]);

  // If no active ride, show locked screen
  if (!rideId) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedTitle}>Chat Unavailable</Text>
        <Text style={styles.lockedSubtitle}>
          Chat becomes available once a ride is accepted.
        </Text>
      </View>
    );
  }


  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const socket = getSocket();

    const msg: Message = {
      id: `${Date.now()}-${Math.random()}`, //better random id
      text: messageText,
      sender: "rider", // update later when you detect driver/rider
      rideId,
    };

    socket.emit("chatMessage", msg);
    setMessageText("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "rider" ? styles.riderBubble : styles.driverBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  riderBubble: {
    backgroundColor: "#ff6b6b",
    alignSelf: "flex-end",
  },
  driverBubble: {
    backgroundColor: "#ccc",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  lockedContainer: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  lockedTitle: {
    fontSize: 22,
    color: "#ffffff",
    marginBottom: 10,
    fontWeight: "600",
  },
  lockedSubtitle: {
    fontSize: 16,
    color: "#cccccc",
    textAlign: "center",
  },
});
