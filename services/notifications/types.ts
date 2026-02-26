// Notification Types
export type NotificationType =
  | 'water-reminder'
  | 'water-reminder-immediate'
  | 'water-goal-achieved'
  | 'daily-summary'
  | 'daily-log-complete'
  | 'daily-summary-late-reminder'
  | 'step-milestone'
  | 'step-hourly-update'
  | 'low-activity-warning'
  | 'daily-step-summary'
  | 'food-suggestion'
  | 'personalized-food-suggestion'
  | 'macro-deficit-warning'
  | 'macro-surplus-warning'
  | 'daily-nutrition-summary';

// Time Configuration
export interface TimeConfig {
  hour: number;
  minute: number;
}

// Water Reminder Preferences
export interface WaterReminderPreferences {
  enabled: boolean;
  startTime: TimeConfig;
  endTime: TimeConfig;
  interval: number; // minutes
}

// Daily Summary Preferences
export interface DailySummaryPreferences {
  enabled: boolean;
  time: TimeConfig;
}

// Step Progress Preferences
export interface StepProgressPreferences {
  enabled: boolean;
  milestones: number[];
}

// Food Suggestion Preferences
export interface FoodSuggestionPreferences {
  enabled: boolean;
  times: TimeConfig[];
}

// Complete Notification Preferences
export interface NotificationPreferences {
  waterReminders: WaterReminderPreferences;
  dailySummary: DailySummaryPreferences;
  stepProgress: StepProgressPreferences;
  foodSuggestions: FoodSuggestionPreferences;
}

// Daily Log Data
export interface DailyLogData {
  meals: boolean;
  water: boolean;
  steps: boolean;
  activities: boolean;
}

export interface DailyLogEntry {
  date: string;
  timestamp: string;
  meals: boolean;
  water: boolean;
  steps: boolean;
  activities: boolean;
  complete: boolean;
}

// Nutrition Data
export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dailyGoals: NutritionGoals;
}

// Meal Data
export interface MealData {
  mealType: string;
  foodItems: string[];
  macros: MacroNutrients;
  timestamp: string;
}

export interface MealLog {
  meals: MealData[];
}

// Step Data
export interface StepData {
  steps: number;
  lastUpdated: string | null;
  date: string;
}

export interface WeeklyStepStats {
  weeklyData: StepData[];
  totalSteps: number;
  averageSteps: number;
}

// Logging Statistics
export interface LoggingStats {
  totalDays: number;
  daysLogged: number;
  percentage: number;
}

// Step Milestone
export interface StepMilestone {
  steps: number;
  message: string;
}

// Food Suggestions
export interface FoodSuggestions {
  message: string;
  foods: string[];
}

// Notification Data
export interface NotificationData {
  type: NotificationType;
  [key: string]: any;
}