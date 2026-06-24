import { useEffect, useState } from 'react';

export function useSSE(url: string) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Event | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      } catch (err) {
        setData(event.data);
      }
    };

    eventSource.onerror = (err) => {
      setError(err);
      eventSource.close(); // Note: in production, you might want to attempt reconnects
    };

    return () => {
      eventSource.close();
    };
  }, [url]);

  return { data, error };
}
