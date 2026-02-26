import * as Notifications from 'expo-notifications';
import NotificationService from './NotificationService';
import WaterReminderService from './WaterReminderService';
import DailySummaryService from './DailySummaryService';
import StepProgressService from './StepProgressService';
import FoodSuggestionService from './FoodSuggestionService';
import {
  NotificationPreferences,
  DailyLogData,
  MacroNutrients,
  NutritionData,
  WeeklyStepStats,
  MacroNutrients as NutritionTotals,
} from './types';

/**
 * Main Notification Manager - orchestrates all notification services
 */
class NotificationManager {
  private isInitialized: boolean = false;
  private preferences: NotificationPreferences | null = null;

  /**
   * Initialize the notification system
   * Call this when app starts
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Request permissions
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Load preferences
      this.preferences = await NotificationService.loadPreferences();

      // Setup notification listeners
      NotificationService.setupListeners(
        this.handleNotificationReceived.bind(this),
        this.handleNotificationResponse.bind(this)
      );

      // Schedule all notifications
      await this.scheduleAllNotifications();

      this.isInitialized = true;
      console.log('Notification system initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing notification system:', error);
      return false;
    }
  }

  /**
   * Schedule all notifications based on current preferences
   */
  async scheduleAllNotifications(): Promise<void> {
    if (!this.preferences) {
      this.preferences = await NotificationService.loadPreferences();
    }

    try {
      // Schedule water reminders
      if (this.preferences.waterReminders.enabled) {
        await WaterReminderService.scheduleWaterReminders(
          this.preferences.waterReminders
        );
        console.log('Water reminders scheduled');
      }

      // Schedule daily summary
      if (this.preferences.dailySummary.enabled) {
        await DailySummaryService.scheduleDailySummary(
          this.preferences.dailySummary
        );
        console.log('Daily summary scheduled');
      }

      // Schedule food suggestions
      if (this.preferences.foodSuggestions.enabled) {
        await FoodSuggestionService.scheduleFoodSuggestions(
          this.preferences.foodSuggestions
        );
        console.log('Food suggestions scheduled');
      }

      console.log('All notifications scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(newPreferences: Partial<NotificationPreferences>): Promise<void> {
    this.preferences = { ...this.preferences!, ...newPreferences };
    await NotificationService.savePreferences(this.preferences);
    await this.scheduleAllNotifications();
  }

  /**
   * Get current preferences
   */
  getPreferences(): NotificationPreferences | null {
    return this.preferences;
  }

  /**
   * Handle notification received while app is foregrounded
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    console.log('Notification received:', notification);
    const { type } = notification.request.content.data;

    // You can add custom logic here based on notification type
    // For example, update UI, show in-app alerts, etc.
  }

  /**
   * Handle notification tap/response
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): Notifications.NotificationResponse {
    console.log('Notification response:', response);
    const { type, action } = response.notification.request.content.data;

    // Navigate to appropriate screen based on notification type
    switch (type) {
      case 'water-reminder':
        // Navigate to water tracking screen
        console.log('Navigate to water tracking');
        break;
      case 'daily-summary':
        // Navigate to daily log screen
        console.log('Navigate to daily log');
        break;
      case 'step-milestone':
      case 'step-hourly-update':
        // Navigate to step tracking screen
        console.log('Navigate to step tracking');
        break;
      case 'food-suggestion':
      case 'personalized-food-suggestion':
        // Navigate to food logging screen
        console.log('Navigate to food logging');
        break;
      default:
        console.log('Unknown notification type:', type);
    }

    return response;
  }

  /**
   * Update step progress (call this when step count changes)
   */
  async updateStepProgress(steps: number, dailyGoal: number = 10000): Promise<void> {
    if (!this.preferences?.stepProgress?.enabled) {
      return;
    }

    // Update stored step data
    await StepProgressService.updateTodayStepData(steps);

    // Check for milestone notifications
    await StepProgressService.checkStepProgress(steps, dailyGoal);
  }

  /**
   * Log water intake
   */
  async logWaterIntake(amount: number): Promise<number> {
    return await WaterReminderService.logWaterIntake(amount);
  }

  /**
   * Log meal
   */
  async logMeal(mealType: string, foodItems: string[], macros: MacroNutrients): Promise<void> {
    const result = await FoodSuggestionService.logMealIntake(
      mealType,
      foodItems,
      macros
    );

    // Check if we should send nutrition warnings
    const totals = await FoodSuggestionService.getTodayNutritionTotals();
    // You can add logic here to check against daily goals
  }

  /**
   * Mark daily data as logged
   */
  async markDailyDataLogged(data: DailyLogData): Promise<void> {
    await DailySummaryService.markTodayAsLogged(data);
  }

  /**
   * Get logging streak
   */
  async getLoggingStreak(): Promise<number> {
    return await DailySummaryService.getLoggingStreak();
  }

  /**
   * Get step statistics
   */
  async getStepStats(): Promise<WeeklyStepStats> {
    return await StepProgressService.getWeeklyStepStats();
  }

  /**
   * Get nutrition totals for today
   */
  async getTodayNutritionTotals(): Promise<NutritionTotals> {
    return await FoodSuggestionService.getTodayNutritionTotals();
  }

  /**
   * Send personalized food suggestion
   */
  async sendFoodSuggestion(mealType: string, nutritionData: NutritionData): Promise<void> {
    await FoodSuggestionService.sendPersonalizedFoodSuggestion(
      mealType,
      nutritionData
    );
  }

  /**
   * Send hourly step update
   */
  async sendStepUpdate(steps: number, dailyGoal: number = 10000): Promise<void> {
    if (this.preferences?.stepProgress?.enabled) {
      await StepProgressService.sendHourlyStepUpdate(steps, dailyGoal);
    }
  }

  /**
   * Check for low activity and send warning if needed
   */
  async checkLowActivity(steps: number): Promise<void> {
    const currentHour = new Date().getHours();
    await StepProgressService.sendLowActivityWarning(steps, currentHour);
  }

  /**
   * Send end-of-day summaries
   */
  async sendEndOfDaySummaries(steps: number, dailyGoal: number = 10000): Promise<void> {
    // Step summary
    await StepProgressService.sendDailyStepSummary(steps, dailyGoal);

    // Nutrition summary
    await FoodSuggestionService.sendDailyNutritionSummary();
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await NotificationService.cancelAllNotifications();
    console.log('All notifications cancelled');
  }

  /**
   * Get all scheduled notifications (for debugging)
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await NotificationService.getAllScheduledNotifications();
  }

  /**
   * Cleanup - call when app unmounts
   */
  cleanup(): void {
    NotificationService.removeListeners();
    this.isInitialized = false;
  }
}

export default new NotificationManager();