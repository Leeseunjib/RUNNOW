import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { firebaseCloud } from './src/core/firebaseClient';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 앱 시작 시 필요한 초기화 작업 수행
    const initApp = async () => {
      // Firebase 세션 확인 등
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
