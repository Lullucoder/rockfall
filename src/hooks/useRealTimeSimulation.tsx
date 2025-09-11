import { useState, useEffect } from 'react';

export const useRealTimeSimulation = (isActive: boolean) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  return { lastUpdate };
};
