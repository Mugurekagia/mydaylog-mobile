import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import {
  DailyLogData,
  DailyLogEntry,
  DailySummaryPreferences,
  LoggingStats,
} from './types';

const DAILY_SUMMARY_ID_KEY = 'dailySummaryNotificationId';

class DailySummaryService {
  /**
   * Schedule daily summary reminder
   */
  async scheduleDailySummary(
    preferences: DailySummaryPreferences
  ): Promise<string | null> {
    await this.cancelDailySummary();

    if (!preferences.enabled) {
      return null;
    }

    const { time } = preferences;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Time to Log Your Day',
        body:
          'Update your daily submissions: meals, water, steps, and activities.',
        data: {
          type: 'daily-summary',
          action: 'open-log-screen',
        },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
        repeats: true,
      } as Notifications.NotificationTriggerInput,
    });

    await AsyncStorage.setItem(DAILY_SUMMARY_ID_KEY, identifier);

    return identifier;
  }

  /**
   * Cancel daily summary reminder
   */
  async cancelDailySummary(): Promise<void> {
    try {
      const id = await AsyncStorage.getItem(DAILY_SUMMARY_ID_KEY);
      if (id) {
        await Notifications.cancelScheduledNotificationAsync(id);
        await AsyncStorage.removeItem(DAILY_SUMMARY_ID_KEY);
      }
    } catch (error) {
      console.error('Error canceling daily summary:', error);
    }
  }

  /**
   * Check if today's log exists
   */
  async checkTodayLogged(): Promise<DailyLogEntry | null> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily-log-${today}`;

    try {
      const logData = await AsyncStorage.getItem(key);
      return logData ? JSON.parse(logData) : null;
    } catch (error) {
      console.error('Error checking daily log:', error);
      return null;
    }
  }

  /**
   * Mark today as logged
   */
  async markTodayAsLogged(
    data: DailyLogData
  ): Promise<DailyLogEntry | null> {
    const today = new Date().toISOString().split('T')[0];
    const key = `daily-log-${today}`;

    try {
      const logData: DailyLogEntry = {
        date: today,
        timestamp: new Date().toISOString(),
        meals: !!data.meals,
        water: !!data.water,
        steps: !!data.steps,
        activities: !!data.activities,
        complete: !!(
          data.meals &&
          data.water &&
          data.steps &&
          data.activities
        ),
      };

      await AsyncStorage.setItem(key, JSON.stringify(logData));

      if (logData.complete) {
        await this.sendCompletionNotification();
      }

      return logData;
    } catch (error) {
      console.error('Error marking daily log:', error);
      return null;
    }
  }

  /**
   * Send completion notification
   */
  private async sendCompletionNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Daily Log Complete!',
        body:
          "Great job! You've logged all your activities for today.",
        data: { type: 'daily-log-complete' },
        sound: true,
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Send late reminder if not complete
   */
  async sendLateReminderIfNeeded(): Promise<void> {
    const todayLog = await this.checkTodayLogged();

    if (!todayLog || !todayLog.complete) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ Don't Forget!",
          body:
            "You haven't completed your daily log yet. Take a moment to update it.",
          data: { type: 'daily-summary-late-reminder' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        } as Notifications.NotificationTriggerInput,
      });
    }
  }

  /**
   * Get logging streak (consecutive complete days)
   */
  async getLoggingStreak(): Promise<number> {
    try {
      let streak = 0;

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);

        const dateStr = checkDate.toISOString().split('T')[0];
        const key = `daily-log-${dateStr}`;
        const logData = await AsyncStorage.getItem(key);

        if (!logData) break;

        const parsed: DailyLogEntry = JSON.parse(logData);

        if (parsed.complete) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  }

  /**
   * Get logging stats for last X days
   */
  async getLoggingStats(days: number = 30): Promise<LoggingStats> {
    try {
      let logged = 0;

      for (let i = 0; i < days; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);

        const dateStr = checkDate.toISOString().split('T')[0];
        const key = `daily-log-${dateStr}`;
        const logData = await AsyncStorage.getItem(key);

        if (logData) {
          const parsed: DailyLogEntry = JSON.parse(logData);
          if (parsed.complete) {
            logged++;
          }
        }
      }

      return {
        totalDays: days,
        daysLogged: logged,
        percentage: days > 0 ? Math.round((logged / days) * 100) : 0,
      };
    } catch (error) {
      console.error('Error getting logging stats:', error);
      return {
        totalDays: days,
        daysLogged: 0,
        percentage: 0,
      };
    }
  }
}

export default new DailySummaryService();
