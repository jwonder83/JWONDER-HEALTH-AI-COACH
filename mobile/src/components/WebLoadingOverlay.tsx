import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  message?: string;
};

export function WebLoadingOverlay({ visible, message = '불러오는 중…' }: Props) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: visible ? 120 : 200,
      useNativeDriver: true,
    }).start();
  }, [opacity, visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.wrap, { opacity }]} pointerEvents={visible ? 'auto' : 'none'}>
      <View style={styles.card}>
        <View style={styles.skeletonRow}>
          <View style={styles.skelBlock} />
          <View style={styles.skelLine} />
          <View style={styles.skelLineShort} />
        </View>
        <ActivityIndicator size="large" color="#047857" style={styles.spinner} />
        <Text style={styles.caption}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  card: {
    width: '78%',
    maxWidth: 360,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15,118,110,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  skeletonRow: {
    gap: 10,
    marginBottom: 16,
  },
  skelBlock: {
    height: 72,
    borderRadius: 12,
    backgroundColor: 'rgba(4,120,87,0.08)',
  },
  skelLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(4,120,87,0.1)',
  },
  skelLineShort: {
    height: 12,
    width: '55%',
    borderRadius: 6,
    backgroundColor: 'rgba(4,120,87,0.07)',
  },
  spinner: {
    marginBottom: 8,
  },
  caption: {
    textAlign: 'center',
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '600',
  },
});
