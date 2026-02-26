import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FoodSuggestionPreferences, MacroNutrients, NutritionData, MealData, MealLog, FoodSuggestions } from './types';

const FOOD_NOTIFICATION_IDS_KEY = 'foodNotificationIds';

class FoodSuggestionService {
  /**
   * Schedule food suggestion notifications
   */
  async scheduleFoodSuggestions(preferences: FoodSuggestionPreferences): Promise<string[]> {
    // Cancel existing food notifications first
    await this.cancelFoodSuggestions();

    if (!preferences.enabled) {
      return [];
    }

    const { times } = preferences;
    const notificationIds: string[] = [];

    const mealTypes = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

    for (let i = 0; i < times.length; i++) {
      const time = times[i];
      const mealType = mealTypes[i] || 'Meal';

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🍽️ ${mealType} Reminder`,
          body: `Time for ${mealType.toLowerCase()}! Check your nutrition goals.`,
          data: { 
            type: 'food-suggestion',
            mealType: mealType.toLowerCase(),
          },
          sound: true,
          categoryIdentifier: 'food-suggestions',
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
        } as Notifications.NotificationTriggerInput,
      });

      notificationIds.push(identifier);
    }

    // Save notification IDs
    await AsyncStorage.setItem(
      FOOD_NOTIFICATION_IDS_KEY,
      JSON.stringify(notificationIds)
    );

    return notificationIds;
  }

  /**
   * Cancel all food suggestion notifications
   */
  async cancelFoodSuggestions(): Promise<void> {
    try {
      const idsJson = await AsyncStorage.getItem(FOOD_NOTIFICATION_IDS_KEY);
      if (idsJson) {
        const ids: string[] = JSON.parse(idsJson);
        for (const id of ids) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
        await AsyncStorage.removeItem(FOOD_NOTIFICATION_IDS_KEY);
      }
    } catch (error) {
      console.error('Error canceling food suggestions:', error);
    }
  }

  /**
   * Send personalized food suggestion based on nutrition goals
   */
  async sendPersonalizedFoodSuggestion(mealType: string, nutritionData: NutritionData): Promise<void> {
    const suggestions = this.generateFoodSuggestions(mealType, nutritionData);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🥗 ${mealType} Suggestion`,
        body: suggestions.message,
        data: { 
          type: 'personalized-food-suggestion',
          mealType,
          suggestions: suggestions.foods,
        },
        sound: true,
        categoryIdentifier: 'food-suggestions',
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Generate food suggestions based on current nutrition data
   */
  private generateFoodSuggestions(mealType: string, nutritionData: NutritionData): FoodSuggestions {
    const { calories, protein, carbs, fats, dailyGoals } = nutritionData;

    // Calculate remaining macros
    const remaining = {
      calories: dailyGoals.calories - calories,
      protein: dailyGoals.protein - protein,
      carbs: dailyGoals.carbs - carbs,
      fats: dailyGoals.fats - fats,
    };

    // Suggest foods based on what's needed
    let suggestions: FoodSuggestions = {
      message: '',
      foods: [],
    };

    if (mealType.toLowerCase() === 'breakfast') {
      if (remaining.protein > 20) {
        suggestions.foods = ['Greek yogurt', 'Eggs', 'Protein shake', 'Oatmeal with nuts'];
        suggestions.message = 'Start your day with protein-rich foods to meet your goals!';
      } else {
        suggestions.foods = ['Whole grain toast', 'Fresh fruit', 'Smoothie bowl'];
        suggestions.message = 'A balanced breakfast will energize your morning!';
      }
    } else if (mealType.toLowerCase() === 'lunch') {
      if (remaining.protein > 30) {
        suggestions.foods = ['Grilled chicken salad', 'Tuna wrap', 'Lentil soup', 'Turkey sandwich'];
        suggestions.message = 'Focus on protein for lunch to stay full longer!';
      } else if (remaining.carbs > 50) {
        suggestions.foods = ['Brown rice bowl', 'Quinoa salad', 'Whole wheat pasta'];
        suggestions.message = 'Add some healthy carbs to fuel your afternoon!';
      } else {
        suggestions.foods = ['Mixed greens salad', 'Vegetable soup', 'Grilled fish'];
        suggestions.message = 'A light, nutritious lunch will keep you energized!';
      }
    } else if (mealType.toLowerCase() === 'dinner') {
      if (remaining.calories < 400) {
        suggestions.foods = ['Grilled vegetables', 'Lean protein', 'Light soup', 'Salad'];
        suggestions.message = 'Keep dinner light - you\'re close to your calorie goal!';
      } else {
        suggestions.foods = ['Balanced plate with protein, veggies, and grains', 'Stir-fry', 'Baked salmon'];
        suggestions.message = 'Enjoy a balanced dinner to complete your nutrition goals!';
      }
    } else if (mealType.toLowerCase() === 'snack') {
      if (remaining.protein > 15) {
        suggestions.foods = ['Protein bar', 'Nuts', 'Cottage cheese', 'Boiled eggs'];
        suggestions.message = 'Grab a protein-rich snack!';
      } else {
        suggestions.foods = ['Fresh fruit', 'Veggie sticks', 'Hummus', 'Rice cakes'];
        suggestions.message = 'A healthy snack to keep you going!';
      }
    }

    return suggestions;
  }

  /**
   * Send macro deficit warning
   */
  async sendMacroDeficitWarning(deficitType: string, remaining: number): Promise<void> {
    const messages: { [key: string]: string } = {
      protein: `⚠️ Low on protein! You need ${remaining}g more to hit your goal.`,
      carbs: `⚠️ Need more carbs! ${remaining}g remaining for your goal.`,
      fats: `⚠️ More healthy fats needed! ${remaining}g to go.`,
      calories: `⚠️ Low on calories! ${remaining} remaining for today.`,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nutrition Alert',
        body: messages[deficitType] || 'Check your nutrition goals!',
        data: { 
          type: 'macro-deficit-warning',
          deficitType,
          remaining,
        },
        sound: true,
        categoryIdentifier: 'food-suggestions',
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Send macro surplus warning
   */
  async sendMacroSurplusWarning(surplusType: string, excess: number): Promise<void> {
    const messages: { [key: string]: string } = {
      protein: `⚠️ You've exceeded your protein goal by ${excess}g.`,
      carbs: `⚠️ Over on carbs by ${excess}g. Consider lighter options.`,
      fats: `⚠️ Fat intake is ${excess}g over your goal.`,
      calories: `⚠️ You've exceeded your calorie goal by ${excess}.`,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nutrition Alert',
        body: messages[surplusType] || 'You\'ve exceeded your nutrition goal!',
        data: { 
          type: 'macro-surplus-warning',
          surplusType,
          excess,
        },
        sound: true,
        categoryIdentifier: 'food-suggestions',
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }

  /**
   * Log meal intake
   */
  async logMealIntake(mealType: string, foodItems: string[], macros: MacroNutrients): Promise<MealLog | null> {
    const today = new Date().toISOString().split('T')[0];
    const key = `meal-log-${today}`;
    
    try {
      const existingLog = await AsyncStorage.getItem(key);
      const log: MealLog = existingLog ? JSON.parse(existingLog) : { meals: [] };

      const mealData: MealData = {
        mealType,
        foodItems,
        macros,
        timestamp: new Date().toISOString(),
      };

      log.meals.push(mealData);

      await AsyncStorage.setItem(key, JSON.stringify(log));
      return log;
    } catch (error) {
      console.error('Error logging meal:', error);
      return null;
    }
  }

  /**
   * Get today's meal log
   */
  async getTodayMealLog(): Promise<MealLog> {
    const today = new Date().toISOString().split('T')[0];
    const key = `meal-log-${today}`;
    
    try {
      const log = await AsyncStorage.getItem(key);
      return log ? JSON.parse(log) : { meals: [] };
    } catch (error) {
      console.error('Error getting meal log:', error);
      return { meals: [] };
    }
  }

  /**
   * Calculate today's nutrition totals
   */
  async getTodayNutritionTotals(): Promise<MacroNutrients> {
    const log = await this.getTodayMealLog();
    
    const totals: MacroNutrients = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    };

    log.meals.forEach(meal => {
      if (meal.macros) {
        totals.calories += meal.macros.calories || 0;
        totals.protein += meal.macros.protein || 0;
        totals.carbs += meal.macros.carbs || 0;
        totals.fats += meal.macros.fats || 0;
      }
    });

    return totals;
  }

  /**
   * Send end-of-day nutrition summary
   */
  async sendDailyNutritionSummary(): Promise<void> {
    const totals = await this.getTodayNutritionTotals();
    const log = await this.getTodayMealLog();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Daily Nutrition Summary',
        body: `Meals: ${log.meals.length} | Calories: ${Math.round(totals.calories)} | Protein: ${Math.round(totals.protein)}g`,
        data: { 
          type: 'daily-nutrition-summary',
          totals,
        },
        sound: true,
        categoryIdentifier: 'food-suggestions',
      },
      trigger: {
        seconds: 1,
      } as Notifications.NotificationTriggerInput,
    });
  }
}

export default new FoodSuggestionService();