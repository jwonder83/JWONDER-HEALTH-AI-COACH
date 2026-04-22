import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import { parseWebToAppMessage } from '../bridge/messages';
import { NativeTabBar } from '../components/NativeTabBar';
import { WebLoadingOverlay } from '../components/WebLoadingOverlay';
import { tabFromPathname, urlForTab, WEB_BASE_URL, type AppTabId } from '../config';
import {
  cancelEngagementSchedule,
  requestNotificationPermissionIfNeeded,
  scheduleEngagementNotifications,
} from '../notifications/engagementNotifications';
import { getNotificationsEnabled, setLoggedInHint, setNotificationsEnabled } from '../storage/appStorage';

function extractUrlFromNotification(
  response: Notifications.NotificationResponse | null | undefined,
): string | null {
  if (!response) return null;
  const data = response.notification.request.content.data;
  if (!data || typeof data !== 'object') return null;
  const u = (data as { url?: unknown }).url;
  return typeof u === 'string' ? u : null;
}

export function MainScreen() {
  const webRef = useRef<WebView>(null);
  const [tab, setTab] = useState<AppTabId>('home');
  const [uri, setUri] = useState(() => urlForTab('home'));
  /** 첫 로드(및 스플래시 해제)에만 전면 오버레이 */
  const [bootLoading, setBootLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  const applyExternalUrl = useCallback((url: string) => {
    setUri(url);
    try {
      const path = new URL(url).pathname;
      const nextTab = tabFromPathname(path);
      if (nextTab) setTab(nextTab);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const enabled = await getNotificationsEnabled();
      if (cancelled) return;
      setNotifEnabled(enabled);
      const perm = await requestNotificationPermissionIfNeeded();
      if (perm !== 'granted' || !enabled) {
        await cancelEngagementSchedule();
      } else {
        await scheduleEngagementNotifications();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void (async () => {
      const last = await Notifications.getLastNotificationResponseAsync();
      const url = extractUrlFromNotification(last);
      if (url) applyExternalUrl(url);
    })();
  }, [applyExternalUrl]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = extractUrlFromNotification(response);
      if (url) applyExternalUrl(url);
    });
    return () => sub.remove();
  }, [applyExternalUrl]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack && webRef.current) {
        webRef.current.goBack();
        return true;
      }
      BackHandler.exitApp();
      return true;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onNavigationStateChange = useCallback((navState: { canGoBack: boolean; url: string }) => {
    setCanGoBack(navState.canGoBack);
    try {
      const u = new URL(navState.url);
      if (!u.href.startsWith(WEB_BASE_URL)) return;
      const nextTab = tabFromPathname(u.pathname);
      if (nextTab) setTab(nextTab);
    } catch {
      /* ignore */
    }
  }, []);

  const onTabChange = useCallback((next: AppTabId) => {
    setTab(next);
    setUri(urlForTab(next));
  }, []);

  const toggleNotifications = useCallback(async (value: boolean) => {
    setNotifEnabled(value);
    await setNotificationsEnabled(value);
    if (!value) {
      await cancelEngagementSchedule();
      return;
    }
    const perm = await requestNotificationPermissionIfNeeded();
    if (perm !== 'granted') {
      Alert.alert('알림 권한', '설정에서 알림을 허용한 뒤 다시 켜 주세요.');
      setNotifEnabled(false);
      await setNotificationsEnabled(false);
      return;
    }
    await scheduleEngagementNotifications();
  }, []);

  const handleNativeRefresh = useCallback(() => {
    webRef.current?.reload();
  }, []);

  const onMessage = useCallback((e: { nativeEvent: { data: string } }) => {
    const msg = parseWebToAppMessage(e.nativeEvent.data);
    if (!msg) return;
    if (msg.type === 'WORKOUT_COMPLETED') {
      void setLoggedInHint(true);
    }
  }, []);

  const onLoadEnd = useCallback(() => {
    setBootLoading(false);
    void SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            Jwonder AI Coach
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={handleNativeRefresh} style={styles.iconBtn} accessibilityLabel="새로고침">
            <Ionicons name="refresh" size={22} color="#047857" />
          </Pressable>
          <Pressable onPress={() => setSettingsOpen(true)} style={styles.iconBtn} accessibilityLabel="알림 설정">
            <Ionicons name="notifications-outline" size={22} color="#047857" />
          </Pressable>
        </View>
      </View>

      <View style={styles.webWrap}>
        <WebView
          ref={webRef}
          source={{ uri }}
          javaScriptEnabled
          domStorageEnabled
          {...(Platform.OS === 'ios' ? { allowsBackForwardNavigationGestures: true } : {})}
          sharedCookiesEnabled
          pullToRefreshEnabled={Platform.OS === 'ios'}
          onNavigationStateChange={onNavigationStateChange}
          onLoadEnd={onLoadEnd}
          onError={onLoadEnd}
          onMessage={onMessage}
          setSupportMultipleWindows={false}
          originWhitelist={['https://*', 'http://*']}
          style={styles.webview}
        />
        <WebLoadingOverlay visible={bootLoading} />
      </View>

      <NativeTabBar active={tab} onChange={onTabChange} />

      <Modal visible={settingsOpen} transparent animationType="fade" onRequestClose={() => setSettingsOpen(false)}>
        <Pressable style={styles.modalScrim} onPress={() => setSettingsOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(ev) => ev.stopPropagation()}>
            <Text style={styles.modalTitle}>알림</Text>
            <Text style={styles.modalBody}>매일 오전 9시, 오후 6시, 오후 9시 운동 리마인더를 받습니다.</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>리마인더 켜기</Text>
              <Switch
                value={notifEnabled}
                onValueChange={(v) => void toggleNotifications(v)}
                trackColor={{ false: '#cbd5e1', true: '#6ee7b7' }}
                thumbColor={notifEnabled ? '#047857' : '#f1f5f9'}
              />
            </View>
            <Pressable style={styles.modalClose} onPress={() => setSettingsOpen(false)}>
              <Text style={styles.modalCloseText}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15,23,42,0.08)',
    backgroundColor: '#fff',
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
  },
  webWrap: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalClose: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 15,
  },
});
