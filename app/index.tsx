import { Redirect } from 'expo-router';
import NotificationManager from '../services/notifications/NotificationManager';

export default function Index() {
  return <Redirect href="/Login" />;
}