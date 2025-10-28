
// --- Start of New GuestView Component ---
import { Button } from "@react-navigation/elements";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";

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

interface GuestViewProps {
  onGoToLogin: () => void;
}

export default function GuestView({ onGoToLogin }: GuestViewProps) {
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
          <Text style={guestStyle.content}>A: You can join by clicking the Log In / Sign Up button below to create your free account.</Text>
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
        <Button style={{backgroundColor: '#007AFF'}} onPress={onGoToLogin}> Log In / Sign Up</Button>
      </View>
    </View>
  );
}

// --- End of New GuestView Component ---