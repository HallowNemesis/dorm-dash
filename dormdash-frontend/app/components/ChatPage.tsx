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
import { useAuthUser } from "../../utils/useAuthUser";

type SenderRole = "rider" | "driver";

type Message = {
  id: string;
  text: string;
  sender: SenderRole;
  rideId: number;
};

type ChatPageProps = {
  rideId: number | null;
};

const messageStore: Record<number, Message[]> = {};

export default function ChatPage({ rideId }: ChatPageProps) {
  const { role } = useAuthUser();

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!rideId) return [];
    return messageStore[rideId] ?? [];
  });

  const [messageText, setMessageText] = useState("");

  // ⬇️ ALWAYS call the hook — early return inside is allowed
  useEffect(() => {
    if (!rideId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const handleNewMessage = (msg: Message) => {
      const existing = messageStore[msg.rideId] ?? [];
      const updated = [...existing, msg];
      messageStore[msg.rideId] = updated;

      if (msg.rideId === rideId) {
        setMessages(updated);
      }
    };

    socket.on("newChatMessage", handleNewMessage);

    // Hydrate past messages
    const existingForRide = messageStore[rideId] ?? [];
    if (existingForRide.length > 0) setMessages(existingForRide);

    return () => {
      socket.off("newChatMessage", handleNewMessage);
    };
  }, [rideId]);

  // ⬇️ UI may now conditionally return
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
    if (!rideId) return;

    const socket = getSocket();

    const senderRole: SenderRole = role === "driver" ? "driver" : "rider";

    const msg: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text: messageText,
      sender: senderRole,
      rideId,
    };

    socket.emit("chatMessage", msg);

    const existing = messageStore[rideId] ?? [];
    const updated = [...existing, msg];
    messageStore[rideId] = updated;

    setMessages(updated);
    setMessageText("");
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === role;

    const label = isMe ? "You" : item.sender === "driver" ? "Driver" : "Rider";

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.selfBubble : styles.otherBubble,
        ]}
      >
        <Text style={styles.senderLabel}>{label}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
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
    borderRadius: 12,
    marginVertical: 5,
  },

  selfBubble: {
    backgroundColor: "#4f8ef7",
    alignSelf: "flex-end",
  },

  otherBubble: {
    backgroundColor: "#34c759",
    alignSelf: "flex-start",
  },

  senderLabel: {
    fontSize: 11,
    color: "#f0f0f0",
    marginBottom: 2,
    opacity: 0.8,
  },

  messageText: {
    color: "#fff",
    fontSize: 15,
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
