import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { WaterReminderPreferences } from './types';

const WATER_NOTIFICATION_IDS_KEY = 'waterNotificationIds';

class WaterReminderService {
  /**
   * Schedule water reminders based on user preferences
   */
  async scheduleWaterReminders(preferences: WaterReminderPreferences): Promise<string[]> {
    // Cancel existing water reminders first
    await this.cancelWaterReminders();

    if (!preferences.enabled) {
      return [];
    }

    const { startTime, endTime, interval } = preferences;
    const notificationIds: string[] = [];

    // Calculate how many reminders to schedule in a day
    const startMinutes = startTime.hour * 60 + startTime.minute;
    const endMinutes = endTime.hour * 60 + endTime.minute;
    const totalMinutes = endMinutes - startMinutes;
    const reminderCount = Math.floor(totalMinutes / interval);

    // Schedule each reminder
    for (let i = 0; i <= reminderCount; i++) {
      const reminderMinutes = startMinutes + (i * interval);
      const hour = Math.floor(reminderMinutes / 60);
      const minute = reminderMinutes % 60;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 Time to Hydrate!',
          body: 'Remember to drink water and stay healthy.',
          data: { type: 'water-reminder' },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'water-reminder',
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        } as Notifications.NotificationTriggerInput,
      });

      notificationIds.push(identifier);
    }

    // Save notification IDs for later cancellation
    await AsyncStorage.setItem(
      WATER_NOTIFICATION_IDS_KEY,
      JSON.stringify(notificationIds)
    );

    return notificationIds;
  }

  /**
   * Cancel all water reminders
   */
  async cancelWaterReminders(): Promise<void> {
    try {
      const idsJson = await AsyncStorage.getItem(WATER_NOTIFICATION_IDS_KEY);
      if (idsJson) {
        const ids: string[] = JSON.parse(idsJson);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        await AsyncStorage.removeItem(WATER_NOTIFICATION_IDS_KEY);
      }
    } catch (error) {
      console.error('Error canceling water reminders:', error);
    }
  }

  /**
   * Send immediate water reminder (for testing or manual trigger)
   */
  async sendImmediateWaterReminder(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 Quick Hydration Reminder',
        body: 'Take a moment to drink some water now!',
        data: { type: 'water-reminder-immediate' },
        sound: true,
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Get scheduled water reminder times
   */
  async getScheduledWaterReminders(): Promise<Notifications.NotificationRequest[]> {
    try {
      const idsJson = await AsyncStorage.getItem(WATER_NOTIFICATION_IDS_KEY);
      if (!idsJson) return [];

      const ids: string[] = JSON.parse(idsJson);
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      
      return allScheduled.filter(notification => 
        ids.includes(notification.identifier)
      );
    } catch (error) {
      console.error('Error getting scheduled water reminders:', error);
      return [];
    }
  }

  /**
   * Update water intake tracking (called when user logs water)
   */
  async logWaterIntake(amount: number): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const key = `water-intake-${today}`;
    
    try {
      const currentIntake = await AsyncStorage.getItem(key);
      const totalIntake = (currentIntake ? parseInt(currentIntake) : 0) + amount;
      await AsyncStorage.setItem(key, totalIntake.toString());

      // Optional: Send encouraging notification when they reach daily goal
      const dailyGoal = 2000; // ml
      if (totalIntake >= dailyGoal && (!currentIntake || parseInt(currentIntake) < dailyGoal)) {
        await this.sendGoalAchievedNotification(totalIntake);
      }

      return totalIntake;
    } catch (error) {
      console.error('Error logging water intake:', error);
      return 0;
    }
  }

  /**
   * Send notification when daily water goal is achieved
   */
  private async sendGoalAchievedNotification(totalIntake: number): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Hydration Goal Achieved!',
        body: `Great job! You've reached ${totalIntake}ml today. Keep it up!`,
        data: { type: 'water-goal-achieved' },
        sound: true,
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }
}

export default new WaterReminderService();