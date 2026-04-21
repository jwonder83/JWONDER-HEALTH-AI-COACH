export type WebToAppMessage =
  | { type: 'WORKOUT_COMPLETED'; completedAt: string }
  | { type: 'PING'; at: string };

export function parseWebToAppMessage(raw: string): WebToAppMessage | null {
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== 'object') return null;
    const type = (data as { type?: unknown }).type;
    if (type === 'WORKOUT_COMPLETED') {
      const completedAt = (data as { completedAt?: unknown }).completedAt;
      return {
        type: 'WORKOUT_COMPLETED',
        completedAt: typeof completedAt === 'string' ? completedAt : new Date().toISOString(),
      };
    }
    if (type === 'PING') {
      const at = (data as { at?: unknown }).at;
      return { type: 'PING', at: typeof at === 'string' ? at : new Date().toISOString() };
    }
    return null;
  } catch {
    return null;
  }
}
