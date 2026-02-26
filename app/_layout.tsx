// app/_layout.tsx
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { AppProvider } from "../context/AppContext";
import NotificationManager from "../services/notifications/NotificationManager";

export default function Layout() {
  useEffect(() => {
    const initNotifications = async () => {
      const success = await NotificationManager.initialize();
      if (success) {
        console.log('✅ Notifications initialized');
      } else {
        console.warn('❌ Notifications failed to initialize');
      }
    };

    initNotifications();

    return () => {
      NotificationManager.cleanup();
    };
  }, []);

  return (
    <AppProvider>
      <Stack />
    </AppProvider>
  );
}