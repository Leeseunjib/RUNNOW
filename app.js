import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { firebaseCloud } from './src/core/firebaseClient';
import { stopOrphanedTracking } from './src/core/nativeLocation';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 앱 시작 시 필요한 초기화 작업 수행
    const initApp = async () => {
      try {
        await stopOrphanedTracking();
      } catch (err) {
        console.warn('고아 GPS 세션 정리 실패:', err);
      }
      const session = await firebaseCloud.getCurrentSession();
      if (session) {
        console.log('User is logged in:', session.uid);
      } else {
        console.log('User is not logged in');
      }
      setIsReady(true);
    };

    initApp();
  }, []);

  if (!isReady) {
    return null; // TODO: 스플래시 화면 렌더링
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
