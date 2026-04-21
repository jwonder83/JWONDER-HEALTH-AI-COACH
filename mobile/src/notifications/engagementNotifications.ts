import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { WEB_BASE_URL } from '../config';

const CHANNEL_ID = 'jw-retention';

const IDS = {
  morning: 'jw-retention-09',
  afternoon: 'jw-retention-18',
  evening: 'jw-retention-21',
} as const;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureAndroidChannel(): Promise<void> {
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: '운동 리마인더',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 120, 250],
  });
}

export async function cancelEngagementSchedule(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(IDS.morning).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(IDS.afternoon).catch(() => undefined);
  await Notifications.cancelScheduledNotificationAsync(IDS.evening).catch(() => undefined);
}

export async function scheduleEngagementNotifications(): Promise<void> {
  await ensureAndroidChannel();
  await cancelEngagementSchedule();

  await Notifications.scheduleNotificationAsync({
    identifier: IDS.morning,
    content: {
      title: 'JWonder',
      body: '오늘 운동 플랜이 준비되었습니다.',
      data: { url: `${WEB_BASE_URL}/` },
      sound: 'default',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      channelId: CHANNEL_ID,
      hour: 9,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: IDS.afternoon,
    content: {
      title: 'JWonder',
      body: '아직 운동을 시작하지 않았습니다.',
      data: { url: `${WEB_BASE_URL}/workout` },
      sound: 'default',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      channelId: CHANNEL_ID,
      hour: 18,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    identifier: IDS.evening,
    content: {
      title: 'JWonder',
      body: '오늘 놓치면 streak가 끊깁니다.',
      data: { url: `${WEB_BASE_URL}/records` },
      sound: 'default',
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      channelId: CHANNEL_ID,
      hour: 21,
      minute: 0,
    },
  });
}

export async function requestNotificationPermissionIfNeeded(): Promise<Notifications.PermissionStatus> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return existing.status;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status;
}
