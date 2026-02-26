import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepData, WeeklyStepStats, StepMilestone } from './types';

const STEP_MILESTONES_KEY = 'stepMilestonesReached';

class StepProgressService {
  /**
   * Check step progress and send notifications for milestones
   */
  async checkStepProgress(currentSteps: number, dailyGoal: number = 10000): Promise<number[]> {
    if (!currentSteps) return [];

    const today = new Date().toISOString().split('T')[0];
    const milestonesKey = `${STEP_MILESTONES_KEY}-${today}`;
    
    try {
      // Get milestones already notified today
      const reachedJson = await AsyncStorage.getItem(milestonesKey);
      const reached: number[] = reachedJson ? JSON.parse(reachedJson) : [];

      // Define milestone thresholds
      const milestones: StepMilestone[] = [
        { steps: 2000, message: '🚶 Nice start! You\'ve walked 2,000 steps.' },
        { steps: 5000, message: '🔥 Halfway there! 5,000 steps completed.' },
        { steps: 7500, message: '💪 Almost there! 7,500 steps done.' },
        { steps: dailyGoal, message: `🎉 Goal achieved! ${dailyGoal} steps completed!` },
      ];

      // Check each milestone
      for (const milestone of milestones) {
        if (currentSteps >= milestone.steps && !reached.includes(milestone.steps)) {
          await this.sendMilestoneNotification(milestone, currentSteps, dailyGoal);
          reached.push(milestone.steps);
        }
      }

      // Save updated milestones
      await AsyncStorage.setItem(milestonesKey, JSON.stringify(reached));

      return reached;
    } catch (error) {
      console.error('Error checking step progress:', error);
      return [];
    }
  }

  /**
   * Send milestone notification
   */
  private async sendMilestoneNotification(
    milestone: StepMilestone,
    currentSteps: number,
    dailyGoal: number
  ): Promise<void> {
    const percentage = Math.round((currentSteps / dailyGoal) * 100);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: milestone.message,
        body: `${currentSteps.toLocaleString()} / ${dailyGoal.toLocaleString()} steps (${percentage}%)`,
        data: { 
          type: 'step-milestone',
          steps: currentSteps,
          milestone: milestone.steps,
        },
        sound: true,
        categoryIdentifier: 'step-progress',
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Send hourly step progress update
   */
  async sendHourlyStepUpdate(currentSteps: number, dailyGoal: number = 10000): Promise<void> {
    const percentage = Math.round((currentSteps / dailyGoal) * 100);
    const remaining = Math.max(0, dailyGoal - currentSteps);

    let message = '';
    if (currentSteps >= dailyGoal) {
      message = `Amazing! You've exceeded your goal by ${(currentSteps - dailyGoal).toLocaleString()} steps!`;
    } else {
      message = `${remaining.toLocaleString()} steps to go. You're ${percentage}% there!`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '👟 Step Update',
        body: message,
        data: { 
          type: 'step-hourly-update',
          steps: currentSteps,
        },
        sound: false, // Less intrusive
        categoryIdentifier: 'step-progress',
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Send low activity warning
   */
  async sendLowActivityWarning(currentSteps: number, currentHour: number): Promise<void> {
    // Only send if it's during waking hours and steps are very low
    if (currentHour >= 8 && currentHour <= 20 && currentSteps < 1000) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏃 Time to Move!',
          body: 'You\'ve only taken a few steps today. Take a short walk to boost your activity!',
          data: { 
            type: 'low-activity-warning',
            steps: currentSteps,
          },
          sound: true,
          categoryIdentifier: 'step-progress',
        },
        trigger: {
          seconds: 1,
        } as Notifications.NotificationTriggerInput,
      });
    }
  }

  /**
   * Get today's step data
   */
  async getTodayStepData(): Promise<StepData> {
    const today = new Date().toISOString().split('T')[0];
    const key = `step-data-${today}`;
    
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : { steps: 0, lastUpdated: null, date: today };
    } catch (error) {
      console.error('Error getting step data:', error);
      return { steps: 0, lastUpdated: null, date: today };
    }
  }

  /**
   * Update today's step data
   */
  async updateTodayStepData(steps: number): Promise<StepData | null> {
    const today = new Date().toISOString().split('T')[0];
    const key = `step-data-${today}`;
    
    try {
      const data: StepData = {
        steps,
        lastUpdated: new Date().toISOString(),
        date: today,
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error updating step data:', error);
      return null;
    }
  }

  /**
   * Get step statistics for the past week
   */
  async getWeeklyStepStats(): Promise<WeeklyStepStats> {
    try {
      const stats: StepData[] = [];
      let currentDate = new Date();
      
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const key = `step-data-${dateStr}`;
        const data = await AsyncStorage.getItem(key);
        
        if (data) {
          stats.push(JSON.parse(data));
        } else {
          stats.push({ date: dateStr, steps: 0, lastUpdated: null });
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
      }
      
      const totalSteps = stats.reduce((sum, day) => sum + day.steps, 0);
      const avgSteps = Math.round(totalSteps / 7);
      
      return {
        weeklyData: stats.reverse(),
        totalSteps,
        averageSteps: avgSteps,
      };
    } catch (error) {
      console.error('Error getting weekly stats:', error);
      return { weeklyData: [], totalSteps: 0, averageSteps: 0 };
    }
  }

  /**
   * Send end-of-day step summary
   */
  async sendDailyStepSummary(steps: number, dailyGoal: number = 10000): Promise<void> {
    const achieved = steps >= dailyGoal;
    const percentage = Math.round((steps / dailyGoal) * 100);

    let title = '';
    let body = '';

    if (achieved) {
      title = '🏆 Daily Step Goal Achieved!';
      body = `Congratulations! You walked ${steps.toLocaleString()} steps today (${percentage}% of goal).`;
    } else {
      title = '📊 Daily Step Summary';
      body = `You walked ${steps.toLocaleString()} steps today (${percentage}% of goal). Keep it up tomorrow!`;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          type: 'daily-step-summary',
          steps,
          achieved,
        },
        sound: true,
        categoryIdentifier: 'step-progress',
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Reset daily milestones (call at start of new day)
   */
  async resetDailyMilestones(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const key = `${STEP_MILESTONES_KEY}-${yesterdayStr}`;
    
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error resetting milestones:', error);
    }
  }
}

export default new StepProgressService();