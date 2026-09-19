import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "http://192.168.1.41:5001";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      await AsyncStorage.setItem("token", response.data.token);

      await AsyncStorage.setItem("role", response.data.user.role);

      Alert.alert("Login Successful", "Welcome to Cine-X!");

      router.replace("/");
    } catch (error: any) {
      console.log("LOGIN ERROR:", error.response?.data || error.message);

      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("role");

    Alert.alert("Logged Out", "Current account has been logged out.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>CINE-X</Text>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>Login to continue watching</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout Current Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  logo: {
    color: "#e50914",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 35,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 15,
  },

  button: {
    backgroundColor: "#e50914",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: "#444",
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },

  logoutText: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "600",
  },

  backText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 25,
    fontSize: 15,
  },
});
