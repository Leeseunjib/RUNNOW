// 현재 RUNNOW 제품을 그대로 띄우는 화면. 웹 코드는 수정하지 않고 잠금 기록만 네이티브가 맡는다.
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { RUNNOW_URL } from '../core/appConfig';
import { COLORS } from '../theme/colors';
import {
  requestRunPermissions,
  startBackgroundLocation,
  stopBackgroundLocation,
} from '../core/nativeLocation';

// 웹의 러닝 버튼을 눌렀는지 네이티브에 알린다. 웹 DOM은 읽기만 하고 바꾸지 않는다.
const BRIDGE = `
(function () {
  if (window.__runnowBridge) return;
  window.__runnowBridge = true;
  var send = function (type) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: type })); } catch (e) {}
  };
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('button') : null;
    if (!el) return;
    if (el.id === 'btn-start-live') send('run-start');
    else if (el.id === 'btn-stop-run') send('run-stop');
    else if (el.id === 'btn-pause-run') send('run-pause');
  }, true);
})();
true;
`;

export default function RunnowWebScreen() {
  const webRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const onMessage = async (event) => {
    let payload = null;
    try {
      payload = JSON.parse(event.nativeEvent.data);
    } catch (err) {
      return;
    }

    try {
      if (payload.type === 'run-start') {
        const perm = await requestRunPermissions();
        if (perm.ok) await startBackgroundLocation();
      } else if (payload.type === 'run-stop') {
        await stopBackgroundLocation();
      }
    } catch (err) {
      console.warn('네이티브 위치 제어 실패:', err);
    }
  };

  if (failed) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />
        <Text style={styles.errTitle}>RUNNOW를 불러오지 못했습니다</Text>
        <Text style={styles.errDesc}>네트워크를 확인한 뒤 다시 시도해 주세요.</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => {
            setFailed(false);
            setLoading(true);
            webRef.current?.reload();
          }}
        >
          <Text style={styles.retryText}>다시 시도</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />
      <WebView
        ref={webRef}
        source={{ uri: RUNNOW_URL }}
        cacheEnabled={false}
        cacheMode="LOAD_NO_CACHE"
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        // 웹의 GPS·카메라·localStorage가 앱 안에서도 그대로 동작해야 한다.
        geolocationEnabled
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mediaCapturePermissionGrantType="grant"
        allowsBackForwardNavigationGestures
        originWhitelist={['https://*']}
        injectedJavaScript={BRIDGE}
        onMessage={onMessage}
        onLoadEnd={() => setLoading(false)}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        pullToRefreshEnabled={Platform.OS === 'ios'}
      />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>RUNNOW 불러오는 중...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  web: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDeep,
    gap: 12,
  },
  loaderText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgDeep,
    padding: 24,
    gap: 10,
  },
  errTitle: {
    color: COLORS.textHigh,
    fontSize: 16,
    fontWeight: '800',
  },
  errDesc: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  retryText: {
    color: '#08090C',
    fontSize: 14,
    fontWeight: '800',
  },
});
