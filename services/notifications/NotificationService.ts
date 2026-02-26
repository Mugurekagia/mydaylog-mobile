import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationPreferences } from './types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } =
        await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push notification permissions!');
      return false;
    }

    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }

    return true;
  }

  /**
   * Setup Android channels
   */
  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync(
      'water-reminders',
      {
        name: 'Water Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        sound: 'default',
      }
    );

    await Notifications.setNotificationChannelAsync(
      'daily-summary',
      {
        name: 'Daily Summary',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      }
    );

    await Notifications.setNotificationChannelAsync(
      'step-progress',
      {
        name: 'Step Progress',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#FF9800',
        sound: 'default',
      }
    );

    await Notifications.setNotificationChannelAsync(
      'food-suggestions',
      {
        name: 'Food Suggestions',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#E91E63',
        sound: 'default',
      }
    );
  }

  /**
   * Setup listeners
   */
  setupListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (
      response: Notifications.NotificationResponse
    ) => void
  ): void {
    this.notificationListener =
      Notifications.addNotificationReceivedListener(
        onNotificationReceived
      );

    this.responseListener =
      Notifications.addNotificationResponseReceivedListener(
        onNotificationResponse
      );
  }

  /**
   * Remove listeners
   */
  removeListeners(): void {
    if (this.notificationListener) {
        this.notificationListener.remove();
        this.notificationListener = null;
    }

    if (this.responseListener) {
        this.responseListener.remove();
        this.responseListener = null;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cancel specific notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Get all scheduled notifications
   */
  async getAllScheduledNotifications(): Promise<any[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Save preferences
   */
  async savePreferences(
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'notificationPreferences',
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Load preferences
   */
  async loadPreferences(): Promise<NotificationPreferences> {
    try {
      const preferences = await AsyncStorage.getItem(
        'notificationPreferences'
      );

      return preferences
        ? JSON.parse(preferences)
        : this.getDefaultPreferences();
    } catch (error) {
      console.error('Error loading preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  /**
   * Default preferences
   */
  getDefaultPreferences(): NotificationPreferences {
    return {
      waterReminders: {
        enabled: true,
        startTime: { hour: 8, minute: 0 },
        endTime: { hour: 22, minute: 0 },
        interval: 60,
      },
      dailySummary: {
        enabled: true,
        time: { hour: 21, minute: 0 },
      },
      stepProgress: {
        enabled: true,
        milestones: [2000, 5000, 7500, 10000],
      },
      foodSuggestions: {
        enabled: true,
        times: [
          { hour: 7, minute: 30 },
          { hour: 12, minute: 0 },
          { hour: 15, minute: 0 },
          { hour: 18, minute: 30 },
        ],
      },
    };
  }
}

export default new NotificationService();
