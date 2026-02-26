import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BASE_URL } from "../config";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Enter username and password.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = { error: "Server returned invalid response" };
      }

      if (response.ok) {
        const token = data.token || data.access;
        const userId = data.user_id || data.user?.id;
        const usernameSaved = data.username || data.user?.username;

        if (!token || !userId || !usernameSaved) {
          Alert.alert("Error", "Login succeeded but missing user data.");
          return;
        }

        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("user_id", String(userId));
        await AsyncStorage.setItem("username", usernameSaved);

        Alert.alert("Success", "Logged in successfully!");
        router.replace("/drawer/Dashboard");
      } else {
        Alert.alert("Error", data.error || "Login failed");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Could not connect to server. Make sure your device and server are on the same network."
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#e8f4fd" />

      {/* Background blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.card}>
        {/* Logo / Icon area */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔐</Text>
        </View>

        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {/* Username */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Username</Text>
          <View style={[styles.inputContainer, usernameFocused && styles.inputFocused]}>
            <Text style={styles.inputIcon}>👤</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#a0c4e8"
              value={username}
              onChangeText={setUsername}
              onFocus={() => setUsernameFocused(true)}
              onBlur={() => setUsernameFocused(false)}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputContainer, passwordFocused && styles.inputFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#a0c4e8"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPassword ? "🙈" : "👁️"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push("/Register")}
          activeOpacity={0.8}
        >
          <Text style={styles.registerBtnText}>Create an Account</Text>
        </TouchableOpacity>

        {/* DEMO BUTTON - remove after presentation */}
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() => router.replace("/drawer/Dashboard")}
          activeOpacity={0.8}
        >
          <Text style={styles.demoBtnText}>👀 Demo Mode</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const THEME = {
  primary: "#3aade0",
  primaryLight: "#e8f4fd",
  primaryMid: "#b3ddf5",
  primaryDark: "#1a8abf",
  card: "#ffffff",
  text: "#1a3a4a",
  textLight: "#5a8aa0",
  border: "#c8e6f7",
  shadow: "#90cce8",
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: THEME.primaryMid,
    opacity: 0.5,
  },
  blobBottom: {
    position: "absolute",
    bottom: -100,
    left: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: THEME.primaryMid,
    opacity: 0.35,
  },
  card: {
    width: "88%",
    maxWidth: 400,
    backgroundColor: THEME.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: THEME.primaryMid,
  },
  iconText: { fontSize: 28 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: THEME.text,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 24,
  },
  inputWrapper: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 6,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: THEME.border,
    borderRadius: 12,
    backgroundColor: "#f5fbff",
    paddingHorizontal: 12,
    height: 50,
  },
  inputFocused: {
    borderColor: THEME.primary,
    backgroundColor: "#ffffff",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: THEME.text,
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 16,
  },
  loginBtn: {
    width: "100%",
    backgroundColor: THEME.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: THEME.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: THEME.textLight,
    fontSize: 13,
  },
  registerBtn: {
    width: "100%",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: THEME.primary,
    backgroundColor: "transparent",
  },
  registerBtnText: {
    color: THEME.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  demoBtn: {
    width: "100%",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginTop: 10,
  },
  demoBtnText: {
    color: THEME.textLight,
    fontSize: 15,
    fontWeight: "600",
  },
});