import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { io, Socket } from "socket.io-client";

// Replace with your backend ngrok or local URL
const API_BASE = "https://dawn-youthful-disrespectfully.ngrok-free.dev/api/auth";

type Message = {
  id: string;
  text: string;
  sender: string; // "rider" or "driver"
};

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const newSocket = io(API_BASE, {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Listen for incoming chat messages
    newSocket.on("newChatMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const msg: Message = {
      id: Math.random().toString(),
      text: messageText,
      sender: "rider", // TODO: set dynamically based on current user role
    };

    socket?.emit("chatMessage", msg);
    setMessages((prev) => [...prev, msg]);
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
          <View style={[styles.messageBubble, item.sender === "rider" ? styles.riderBubble : styles.driverBubble]}>
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
});
