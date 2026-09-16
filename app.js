import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RunnowWebScreen from './src/screens/RunnowWebScreen';
import { stopOrphanedTracking } from './src/core/nativeLocation';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      // 앱이 강제 종료된 뒤 남아 있는 위치 추적 세션을 정리한다.
      try {
        await stopOrphanedTracking();
      } catch (err) {
        console.warn('고아 GPS 세션 정리 실패:', err);
      }
      setIsReady(true);
    };

    initApp();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <RunnowWebScreen />
    </SafeAreaProvider>
  );
}
