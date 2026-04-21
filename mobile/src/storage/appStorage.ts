import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_ENABLED_KEY = 'jw:settings:notificationsEnabled';
const LOGGED_IN_HINT_KEY = 'jw:settings:loggedInHint';

export async function getNotificationsEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  if (v === null) return true;
  return v === '1';
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? '1' : '0');
}

export async function getLoggedInHint(): Promise<boolean> {
  const v = await AsyncStorage.getItem(LOGGED_IN_HINT_KEY);
  if (v === null) return false;
  return v === '1';
}

export async function setLoggedInHint(loggedIn: boolean): Promise<void> {
  await AsyncStorage.setItem(LOGGED_IN_HINT_KEY, loggedIn ? '1' : '0');
}
