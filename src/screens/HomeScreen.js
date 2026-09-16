import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  Alert,
  AppState,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { DOG_STAGES, CAT_STAGES } from '../core/tamagotchi';
import AdSenseBanner from '../components/AdSenseBanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseCloud } from '../core/firebaseClient';
import { runSession, subscribeRunSession, persistRunSession, restoreRunSession } from '../core/runSession';
import {
  requestRunPermissions,
  startBackgroundLocation,
  stopBackgroundLocation,
} from '../core/nativeLocation';

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('tamagotchi'); // 'tamagotchi' | 'runner'
  const [petType, setPetType] = useState('dog'); // 'dog' | 'cat'
  const [userName, setUserName] = useState('이건우 대표님');
  const [userId, setUserId] = useState(null);
  
  // 다마고치 & 유저 지표 상태 (Firebase 연동)
  const [stats, setStats] = useState({
    hunger: 85,
    happiness: 92,
    energy: 68,
    xp: 340,
    maxXp: 500,
    totalKm: 24.8,
    streak: 5,
    coins: 1480,
  });

  // 러닝 세션 상태
  const [isRunning, setIsRunning] = useState(false);
  const [runSeconds, setRunSeconds] = useState(0);
  const [runDistance, setRunDistance] = useState(0.0);
  const [currentPace, setCurrentPace] = useState("0'00\"");
  const [runCalories, setRunCalories] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState('대기중');

  // 1. Firebase 및 로컬 캐시 데이터 초기 로드
  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        const session = await firebaseCloud.getCurrentSession();
        if (session) {
          setUserId(session.uid);
          if (session.displayName) setUserName(session.displayName);
          
          // Firestore에서 최신 유저 프로필 조회
          const userDoc = await firebaseCloud.getUser(session.uid);
          if (userDoc) {
            setStats((prev) => ({
              ...prev,
              coins: userDoc.coins ?? prev.coins,
              totalKm: userDoc.totalKm ?? prev.totalKm,
              streak: userDoc.streak ?? prev.streak,
            }));
          }

          // Firestore에서 다마고치 펫 상태 조회
          const petDoc = await firebaseCloud.getTamagotchi(session.uid);
          if (petDoc) {
            setStats((prev) => ({ ...prev, ...petDoc }));
            if (petDoc.petType) setPetType(petDoc.petType);
          }
        }
        
        // 로컬 캐시된 펫 상태 로드
        const localPet = await AsyncStorage.getItem('RUNNOW_GLOBAL_PET');
        if (localPet) {
          const parsed = JSON.parse(localPet);
          setStats((prev) => ({ ...prev, ...parsed }));
          if (parsed.petType) setPetType(parsed.petType);
        }
      } catch (err) {
        console.warn('Firebase sync error on HomeScreen:', err);
      }
    };

    loadFirebaseData();
  }, []);

  useEffect(() => {
    restoreRunSession().then((restored) => {
      if (!restored) return;
      applyRunStats(runSession.getStats());
      if (runSession.isTracking && !runSession.isPaused) setIsRunning(true);
    });
  }, []);

  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const applyRunStats = (stats) => {
    if (!stats) return;
    setRunSeconds(stats.elapsedSeconds || 0);
    setRunDistance(stats.distanceKm || 0);
    setRunCalories(stats.calories || 0);
    setCurrentPace(stats.currentPace && stats.currentPace !== `--'--"` ? stats.currentPace : stats.pace);
    if (stats.gpsAccuracy) setGpsAccuracy(stats.gpsAccuracy);
  };

  useEffect(() => {
    return subscribeRunSession(applyRunStats);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') applyRunStats(runSession.getStats());
    });
    return () => sub.remove();
  }, []);

  // 펄스 애니메이션
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // 화면이 켜져 있을 때만 1초마다 벽시계 시간을 반영한다. 잠금 중 거리는 백그라운드 태스크가 쌓는다.
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        applyRunStats(runSession.getStats());
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSec) => {
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleFeed = () => {
    if (stats.hunger >= 100) {
      Alert.alert('포만감 가득!', '댕댕이가 이미 배가 불러요! 달려서 소화시켜 주세요.');
      return;
    }
    setStats((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 15),
      happiness: Math.min(100, prev.happiness + 5),
      xp: prev.xp + 20,
    }));
    Alert.alert('🍖 맛있는 영양식 완료!', '배고픔 +15%, 행복도 +5%, XP +20 획득!');
  };

  const handlePlay = () => {
    if (stats.energy < 20) {
      Alert.alert('에너지 부족!', '댕댕이가 지쳤어요. 휴식을 취하게 해주세요.');
      return;
    }
    setStats((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 15),
      energy: Math.max(0, prev.energy - 15),
      xp: prev.xp + 30,
    }));
    Alert.alert('🎾 신나는 원반놀이 완료!', '행복도 +15%, 에너지 -15%, XP +30 획득!');
  };

  const handleRest = () => {
    setStats((prev) => ({
      ...prev,
      energy: 100,
    }));
    Alert.alert('💤 꿀잠 휴식 완료!', '에너지가 100% 가득 찼습니다!');
  };

  const handleToggleRun = async () => {
    if (!isRunning) {
      try {
        if (!runSession.isTracking) {
          const perm = await requestRunPermissions();
          if (!perm.ok) {
            const webMsg = perm.stage === 'web'
              ? '잠금 중 기록은 폰 앱 개발 빌드에서만 동작합니다. Expo Go가 아니라 설치 빌드로 열어 주세요.'
              : '러닝 기록을 위해 위치 권한을 허용해 주세요.';
            Alert.alert('위치 권한 필요', webMsg);
            return;
          }
          runSession.startNativeSession();
          await persistRunSession();
          await startBackgroundLocation();
          applyRunStats(runSession.getStats());
          if (!perm.background) {
            Alert.alert(
              '잠금 시 기록이 끊길 수 있습니다',
              '폰 설정 → 위치에서 RUNNOW를 "항상 허용"으로 바꿔 주세요.'
            );
          }
        } else {
          runSession.resumeRun();
          await persistRunSession();
          await startBackgroundLocation();
          applyRunStats(runSession.getStats());
        }
        setIsRunning(true);
      } catch (err) {
        console.warn('러닝 시작 실패:', err);
        Alert.alert('GPS를 시작하지 못했습니다', String(err?.message || err));
      }
      return;
    }

    runSession.pauseRun();
    await persistRunSession();
    try {
      await stopBackgroundLocation();
    } catch (err) {
      console.warn('러닝 일시정지 GPS 중지 실패:', err);
    }
    applyRunStats(runSession.getStats());
    setIsRunning(false);
  };

  const handleFinishRun = async () => {
    setIsRunning(false);
    try {
      await stopBackgroundLocation();
    } catch (err) {
      console.warn('러닝 종료 GPS 중지 실패:', err);
    }

    const runStats = runSession.stopRun();
    const addedKm = runStats.distanceKm || 0;
    const addedXp = Math.round(addedKm * 100);
    const addedCoins = Math.round(addedKm * 50);
    const elapsed = runStats.elapsedSeconds || runSeconds;
    const calories = runStats.calories || runCalories;
    const pace = runStats.currentPace && runStats.currentPace !== `--'--"` ? runStats.currentPace : runStats.pace;

    const updatedStats = {
      ...stats,
      totalKm: +(stats.totalKm + addedKm).toFixed(2),
      xp: stats.xp + addedXp,
      coins: stats.coins + addedCoins,
      happiness: Math.min(100, stats.happiness + 20),
    };

    setStats(updatedStats);
    runSession.reset();
    await persistRunSession();

    // 1. 로컬 영구 캐시 저장
    AsyncStorage.setItem('RUNNOW_GLOBAL_PET', JSON.stringify(updatedStats)).catch(() => {});

    // 2. Firebase Cloud Firestore 실시간 동기화
    if (userId) {
      firebaseCloud.saveWorkout(userId, {
        distanceKm: addedKm,
        durationSeconds: elapsed,
        calories,
        pace,
        type: 'gps_run',
      });
      firebaseCloud.syncUser(userId, {
        totalKm: updatedStats.totalKm,
        coins: updatedStats.coins,
      });
      firebaseCloud.syncTamagotchi(userId, updatedStats);
    }

    Alert.alert(
      '🏁 러닝 완료 & Firebase 클라우드 저장!',
      `거리: ${addedKm} km\n시간: ${formatTime(elapsed)}\n획득 보상: +${addedCoins} VC, +${addedXp} XP\n\nFirebase 클라우드와 안전하게 동기화되었습니다!`,
      [{ text: '확인', onPress: () => { setRunSeconds(0); setRunDistance(0); setRunCalories(0); setGpsAccuracy('대기중'); } }]
    );
  };

  // 현재 스테이지 계산
  const stages = petType === 'dog' ? DOG_STAGES : CAT_STAGES;
  const currentStage = stages.find((s) => stats.totalKm >= s.minKm) || stages[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />
      
      {/* 1. 상단 글로벌 허브 바 */}
      <View style={styles.headerHub}>
        <View style={styles.userInfoBox}>
          <Text style={styles.userBadge}>LV. 3 RUNNER</Text>
          <Text style={styles.userName}>이건우 대표님</Text>
        </View>

        <View style={styles.assetPills}>
          <View style={styles.coinPill}>
            <Text style={styles.coinIcon}>⚡</Text>
            <Text style={styles.coinText}>{stats.coins.toLocaleString()} VC</Text>
          </View>
          <View style={styles.streakPill}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{stats.streak}일 연속</Text>
          </View>
        </View>
      </View>

      {/* 2. 듀얼 모드 토글 바 */}
      <View style={styles.modeTabsWrapper}>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'tamagotchi' && styles.modeTabActive]}
          onPress={() => setActiveTab('tamagotchi')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeTabText, activeTab === 'tamagotchi' && styles.modeTabTextActive]}>
            🐾 런고치 룸
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'runner' && styles.modeTabActive]}
          onPress={() => setActiveTab('runner')}
          activeOpacity={0.8}
        >
          <Text style={[styles.modeTabText, activeTab === 'runner' && styles.modeTabTextActive]}>
            ⚡ GPS 라이브 런
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'tamagotchi' ? (
          /* ================= MODE A: 다마고치 룸 ================= */
          <View style={styles.tamagotchiSection}>
            {/* 캐릭터 카드 */}
            <View style={styles.petCard}>
              <View style={styles.petHeaderRow}>
                <View>
                  <Text style={styles.stageTag}>PHASE 3 진화체</Text>
                  <Text style={styles.petTitle}>{currentStage.nameKo}</Text>
                </View>

                {/* 댕댕이/냥이 전환 버튼 */}
                <TouchableOpacity
                  style={styles.petTypeSwitch}
                  onPress={() => setPetType((p) => (p === 'dog' ? 'cat' : 'dog'))}
                >
                  <Text style={styles.petTypeSwitchText}>
                    {petType === 'dog' ? '🐱 냥이로 전환' : '🐶 댕댕이로 전환'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 아바타 애니메이션 컨테이너 */}
              <View style={styles.avatarStage}>
                <Animated.View style={[styles.avatarAura, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarEmoji}>{currentStage.icon}</Text>
                  </View>
                </Animated.View>
                <Text style={styles.petTagline}>{currentStage.tagline}</Text>
              </View>

              {/* 경험치 프로그레스 */}
              <View style={styles.xpContainer}>
                <View style={styles.xpHeader}>
                  <Text style={styles.xpLabel}>성장 경험치 (XP)</Text>
                  <Text style={styles.xpVal}>{stats.xp} / {stats.maxXp} XP</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${(stats.xp / stats.maxXp) * 100}%` }]} />
                </View>
              </View>

              {/* 3대 바이탈 게이지 */}
              <View style={styles.vitalsRow}>
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>🍖</Text>
                  <Text style={styles.vitalName}>포만감</Text>
                  <Text style={styles.vitalPercent}>{stats.hunger}%</Text>
                  <View style={styles.miniGaugeBg}>
                    <View style={[styles.miniGaugeFill, { width: `${stats.hunger}%`, backgroundColor: '#FF9800' }]} />
                  </View>
                </View>

                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>💖</Text>
                  <Text style={styles.vitalName}>행복도</Text>
                  <Text style={styles.vitalPercent}>{stats.happiness}%</Text>
                  <View style={styles.miniGaugeBg}>
                    <View style={[styles.miniGaugeFill, { width: `${stats.happiness}%`, backgroundColor: '#E91E63' }]} />
                  </View>
                </View>

                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>⚡</Text>
                  <Text style={styles.vitalName}>에너지</Text>
                  <Text style={styles.vitalPercent}>{stats.energy}%</Text>
                  <View style={styles.miniGaugeBg}>
                    <View style={[styles.miniGaugeFill, { width: `${stats.energy}%`, backgroundColor: COLORS.secondary }]} />
                  </View>
                </View>
              </View>

              {/* 4대 케어 액션 버튼들 */}
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleFeed} activeOpacity={0.8}>
                  <Text style={styles.actionBtnIcon}>🍖</Text>
                  <Text style={styles.actionBtnText}>밥주기</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handlePlay} activeOpacity={0.8}>
                  <Text style={styles.actionBtnIcon}>🎾</Text>
                  <Text style={styles.actionBtnText}>놀아주기</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={handleRest} activeOpacity={0.8}>
                  <Text style={styles.actionBtnIcon}>💤</Text>
                  <Text style={styles.actionBtnText}>휴식하기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.actionBtnRescue]}
                  onPress={() => Alert.alert('💊 힐링케어', 'VIP 회원은 12시간마다 무료 회복 부스터가 적용됩니다.')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionBtnIcon}>💊</Text>
                  <Text style={styles.actionBtnText}>힐링케어</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 누적 러닝 기록 요약 */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>🏆 내 누적 러닝 성과</Text>
              <View style={styles.summaryMetricsRow}>
                <View style={styles.summaryMetric}>
                  <Text style={styles.metricBig}>{stats.totalKm}</Text>
                  <Text style={styles.metricUnit}>누적 km</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.summaryMetric}>
                  <Text style={styles.metricBig}>1,840</Text>
                  <Text style={styles.metricUnit}>소모 kcal</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.summaryMetric}>
                  <Text style={styles.metricBig}>2h 18m</Text>
                  <Text style={styles.metricUnit}>총 러닝시간</Text>
                </View>
              </View>
            </View>

            {/* Google AdSense Display Slot */}
            <AdSenseBanner label="PARTNER SPOTLIGHT" slot="1001" />
          </View>
        ) : (
          /* ================= MODE B: GPS 라이브 런 HUD ================= */
          <View style={styles.runnerSection}>
            <View style={styles.hudCard}>
              <View style={styles.gpsStatusRow}>
                <View style={styles.gpsDot} />
                <Text style={styles.gpsStatusText}>{gpsAccuracy}</Text>
              </View>

              {/* 초대형 NRC 스타일 거리 지표 */}
              <View style={styles.mainMetricBox}>
                <Text style={styles.mainDistNum}>{runDistance.toFixed(2)}</Text>
                <Text style={styles.mainDistLabel}>KILOMETERS</Text>
              </View>

              {/* 실시간 서브 지표 3단 그리드 */}
              <View style={styles.subMetricsRow}>
                <View style={styles.subMetricCol}>
                  <Text style={styles.subMetricLabel}>페이스</Text>
                  <Text style={styles.subMetricVal}>{currentPace}</Text>
                  <Text style={styles.subMetricSub}>/km</Text>
                </View>

                <View style={styles.subMetricCol}>
                  <Text style={styles.subMetricLabel}>러닝 시간</Text>
                  <Text style={styles.subMetricVal}>{formatTime(runSeconds)}</Text>
                  <Text style={styles.subMetricSub}>mm:ss</Text>
                </View>

                <View style={styles.subMetricCol}>
                  <Text style={styles.subMetricLabel}>소모 칼로리</Text>
                  <Text style={styles.subMetricVal}>{runCalories}</Text>
                  <Text style={styles.subMetricSub}>kcal</Text>
                </View>
              </View>

              {/* 함께 뛰는 다마고치 동반자 배너 */}
              <View style={styles.companionBadge}>
                <Text style={styles.companionIcon}>🐕</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.companionTitle}>댕댕이가 곁에서 달리는 중!</Text>
                  <Text style={styles.companionDesc}>함께 뛸 때 볼트코인 획득량 1.5배 부스터가 적용됩니다.</Text>
                </View>
              </View>

              {/* 컨트롤 버튼 그룹 */}
              <View style={styles.runControlsRow}>
                <TouchableOpacity
                  style={[styles.runMainBtn, isRunning ? styles.runPauseBtn : styles.runStartBtn]}
                  onPress={handleToggleRun}
                  activeOpacity={0.8}
                >
                  <Text style={styles.runMainBtnText}>
                    {isRunning ? '일시 정지 ⏸️' : '러닝 시작 ▶️'}
                  </Text>
                </TouchableOpacity>

                {(runSeconds > 0 || runDistance > 0) && (
                  <TouchableOpacity
                    style={styles.runFinishBtn}
                    onPress={handleFinishRun}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.runFinishBtnText}>종료 및 저장 ⏹️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  headerHub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  userInfoBox: {
    justifyContent: 'center',
  },
  userBadge: {
    ...TYPOGRAPHY.small,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  userName: {
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginTop: 2,
  },
  assetPills: {
    flexDirection: 'row',
    gap: 8,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  coinIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  coinText: {
    ...TYPOGRAPHY.small,
    color: COLORS.primary,
    fontWeight: '800',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },
  streakIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    ...TYPOGRAPHY.small,
    color: COLORS.accent,
    fontWeight: '800',
  },
  modeTabsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  modeTab: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  modeTabText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  modeTabTextActive: {
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  tamagotchiSection: {
    gap: 16,
  },
  petCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  petHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stageTag: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  petTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginTop: 2,
  },
  petTypeSwitch: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  petTypeSwitchText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  avatarStage: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarAura: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 56,
  },
  petTagline: {
    fontSize: 12,
    color: COLORS.textSub,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  xpContainer: {
    marginTop: 8,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  xpVal: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  vitalIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  vitalName: {
    fontSize: 11,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  vitalPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginTop: 2,
    marginBottom: 6,
  },
  miniGaugeBg: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniGaugeFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    minHeight: 64,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionBtnRescue: {
    borderColor: 'rgba(255, 87, 34, 0.4)',
  },
  actionBtnIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  actionBtnText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textHigh,
  },
  summaryCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  summaryTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginBottom: 14,
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryMetric: {
    alignItems: 'center',
  },
  metricBig: {
    ...TYPOGRAPHY.h3,
    fontWeight: '900',
    color: COLORS.primary,
  },
  metricUnit: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderLight,
  },
  runnerSection: {
    gap: 16,
  },
  hudCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    alignItems: 'center',
  },
  gpsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  gpsStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  mainMetricBox: {
    alignItems: 'center',
    marginVertical: 10,
  },
  mainDistNum: {
    fontSize: 72,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -2,
  },
  mainDistLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textSub,
    letterSpacing: 2,
    marginTop: -4,
  },
  subMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 24,
    paddingHorizontal: 10,
  },
  subMetricCol: {
    alignItems: 'center',
  },
  subMetricLabel: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textSub,
    marginBottom: 4,
  },
  subMetricVal: {
    ...TYPOGRAPHY.h2,
    fontWeight: '900',
    color: COLORS.textHigh,
  },
  subMetricSub: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  companionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    width: '100%',
    marginBottom: 24,
    gap: 12,
  },
  companionIcon: {
    fontSize: 28,
  },
  companionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '800',
    color: COLORS.primary,
  },
  companionDesc: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    marginTop: 2,
  },
  runControlsRow: {
    width: '100%',
    gap: 12,
  },
  runMainBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  runStartBtn: {
    backgroundColor: COLORS.primary,
  },
  runPauseBtn: {
    backgroundColor: COLORS.accent,
  },
  runMainBtnText: {
    ...TYPOGRAPHY.h3,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  runFinishBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  runFinishBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '800',
    color: COLORS.textHigh,
  },
});
