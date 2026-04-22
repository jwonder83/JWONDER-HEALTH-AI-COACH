import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppTabId } from '../config';

type Props = {
  active: AppTabId;
  onChange: (tab: AppTabId) => void;
};

const TABS: { id: AppTabId; label: string; icon: keyof typeof Ionicons.glyphMap; iconActive: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'home', label: '홈', icon: 'home-outline', iconActive: 'home' },
  { id: 'routine', label: '프로그램', icon: 'calendar-outline', iconActive: 'calendar' },
  { id: 'records', label: '성과', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  { id: 'profile', label: '설정', icon: 'person-outline', iconActive: 'person' },
];

export function NativeTabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((t) => {
        const selected = active === t.id;
        return (
          <Pressable
            key={t.id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(t.id)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <Ionicons name={selected ? t.iconActive : t.icon} size={22} color={selected ? '#5b21b6' : '#64748b'} />
            <Text style={[styles.label, selected && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15,23,42,0.08)',
    backgroundColor: '#f8fafc',
    paddingTop: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  itemPressed: {
    opacity: 0.75,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  labelActive: {
    color: '#5b21b6',
  },
});
