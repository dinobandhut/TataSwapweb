import { useEffect, useRef, useState } from 'react';

export interface DexWsEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export function useDexWebSocket(onEvent?: (event: DexWsEvent) => void) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<DexWsEvent | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ws: WebSocket | null = null;
    let closedByUser = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closedByUser) return;
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${proto}//${window.location.host}/ws`;
      try {
        ws = new WebSocket(url);
        ws.onopen = () => {
          setConnected(true);
        };
        ws.onclose = () => {
          setConnected(false);
          if (!closedByUser) {
            reconnectTimer = setTimeout(connect, 4000);
          }
        };
        ws.onerror = () => {
          setConnected(false);
        };
        ws.onmessage = (msg) => {
          try {
            const parsed = JSON.parse(msg.data) as DexWsEvent;
            setLastEvent(parsed);
            onEventRef.current?.(parsed);
          } catch {
            // Ignore malformed message
          }
        };
      } catch {
        setConnected(false);
      }
    };

    connect();
    return () => {
      closedByUser = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  return { connected, lastEvent };
}
