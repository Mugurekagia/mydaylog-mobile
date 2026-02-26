import { Ionicons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#F5FBFF',
          width: 280,
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#4CAF50',
        drawerInactiveTintColor: '#666',
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        options={{ 
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Goals" 
        options={{ 
          title: 'Goals',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="flag" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Meals" 
        options={{ 
          title: 'Meals',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Meditation" 
        options={{ 
          title: 'Meditation',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Mood" 
        options={{ 
          title: 'Mood',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="happy" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="ScreenTime" 
        options={{ 
          title: 'Screen Time',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="phone-portrait" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Sleep" 
        options={{ 
          title: 'Sleep',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="moon" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Steps" 
        options={{ 
          title: 'Steps',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="walk" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Water" 
        options={{ 
          title: 'Water',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="water" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="StreaksAndBadges"
        options={{ 
         title: 'Streaks & Badges',
         drawerIcon: ({ color, size }) => (
          <Ionicons name="trophy" size={size} color={color} />
         ),
      }} 
    />




      <Drawer.Screen 
        name="Settings" 
        options={{ 
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }} 
      />
    </Drawer>
  );
}
