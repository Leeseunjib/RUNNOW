import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import AdSenseBanner from '../components/AdSenseBanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseCloud } from '../core/firebaseClient';

const COACHES = [
  {
    id: 'leo',
    name: '코치 레오',
    role: '파워 PT',
    icon: '🦁',
    badge: '하체 & 체력',
    intro: '대표님, 반갑습니다! 오늘 목표 칼로리 버닝과 하체 강화, 제가 확실하게 끌어드리겠습니다! 어떤 운동 플랜을 짤까요?',
  },
  {
    id: 'luna',
    name: '코치 루나',
    role: '페이스 코치',
    icon: '🌙',
    badge: '지구력 & 자세',
    intro: '안녕하세요 대표님! 섬세한 자세 교정과 꾸준한 루틴을 책임지는 코치 루나예요. 무리하지 않고 오래 달릴 수 있는 러닝 플랜을 함께 세워봐요.',
  },
  {
    id: 'ellie',
    name: '영양 코치 엘리',
    role: '식단 & 영양',
    icon: '🥗',
    badge: '단백질 & 클린식단',
    intro: '대표님, 오늘 식사 맛있게 드셨나요? 오늘 태운 운동 칼로리와 딱 맞물리는 최적의 단백질 밸런스를 가이드해 드릴게요!',
  },
  {
    id: 'drkay',
    name: '닥터 케이',
    role: '메디컬 닥터',
    icon: '🩺',
    badge: '부상 방지 & 회복',
    intro: '안녕하세요 대표님, 닥터 케이입니다. 러닝 전후 관절 컨디션이나 심박수, 피로도 관리에 대해 무엇이든 편하게 물어보세요.',
  },
];

export default function CareTeamScreen() {
  const [selectedCoachId, setSelectedCoachId] = useState('leo');
  const [assignedCoachId, setAssignedCoachId] = useState('leo');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [userName, setUserName] = useState('대표님');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'coach',
      coachId: 'leo',
      text: COACHES[0].intro,
      time: '오전 10:30',
    },
  ]);
  const [inputText, setInputText] = useState('');

  // 1. Firebase 및 로컬 스토리지 전담 코치 동기화
  React.useEffect(() => {
    const initCareTeam = async () => {
      try {
        const savedAssigned = await AsyncStorage.getItem('RUNNOW_ASSIGNED_COACH');
        if (savedAssigned) {
          setAssignedCoachId(savedAssigned);
          setSelectedCoachId(savedAssigned);
        }
        const savedTts = await AsyncStorage.getItem('RUNNOW_TTS_ENABLED');
        if (savedTts !== null) {
          setTtsEnabled(savedTts !== 'false');
        }
        // Firebase 세션 사용자 이름 연동
        const session = await firebaseCloud.getCurrentSession();
        if (session && session.displayName) {
          setUserName(session.displayName);
        }
      } catch (e) {
        console.warn('CareTeam init error:', e);
      }
    };
    initCareTeam();
  }, []);

  const currentCoach = COACHES.find((c) => c.id === selectedCoachId) || COACHES[0];
  const isCurrentlyAssigned = assignedCoachId === selectedCoachId;

  // 전담 코치 지정 핸들러 (Web과 1:1 동일 로직)
  const handleSetAssigned = async () => {
    try {
      await AsyncStorage.setItem('RUNNOW_ASSIGNED_COACH', selectedCoachId);
      setAssignedCoachId(selectedCoachId);
      Alert.alert(
        '⭐ 1:1 전담 코치 지정 완료',
        `${currentCoach.name} 코치가 ${userName}의 전담 코치로 고정되었습니다!\n운동 및 러닝 시작 시 최우선 배정됩니다.`
      );
    } catch (e) {
      console.warn('Failed to save assigned coach:', e);
    }
  };

  // TTS 음성 토글 핸들러
  const handleToggleTts = async () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    await AsyncStorage.setItem('RUNNOW_TTS_ENABLED', String(next));
  };

  const handleSelectCoach = (coach) => {
    setSelectedCoachId(coach.id);
    setMessages([
      {
        id: Date.now(),
        sender: 'coach',
        coachId: coach.id,
        text: coach.intro,
        time: '방금 전',
      },
    ]);
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: '방금 전',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // AI 코치 응답 시뮬레이션 (Firebase Cloud 연동 확장점)
    setTimeout(() => {
      let reply = '';
      if (selectedCoachId === 'leo') {
        reply = `${userName}, 말씀해주신 "${text}" 관련해서는 주 3회 4.5km 빌드업 러닝과 인터벌 트레이닝을 권장합니다! 바로 오늘부터 첫 세트를 시작해 보시죠. 🔥`;
      } else if (selectedCoachId === 'luna') {
        reply = `${userName}, 조급해하지 마세요. "${text}" 목표는 1km당 5분 30초 안정적인 페이스로 호흡을 2들숨 2날숨으로 가져가는 것이 핵심이에요. 함께 천천히 뛰어봐요! 🌿`;
      } else if (selectedCoachId === 'ellie') {
        reply = `${userName}, 러닝 후 30분 이내에 닭가슴살 또는 프로틴 쉐이크(단백질 25g)와 전해질 수분 500ml를 보충해주시면 근육 회복에 최고의 효과가 납니다! 🥗`;
      } else {
        reply = `${userName}, 무릎과 발목 관절의 과도한 충격을 줄이려면 착지 시 미드풋(발바닥 중앙)을 의식하고 폼롤러로 대퇴사두근과 종아리를 10분간 스트레칭해 주세요. 🩺`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'coach',
          coachId: selectedCoachId,
          text: reply,
          time: '방금 전',
        },
      ]);
    }, 800);
  };

  // 웹과 100% 동일한 소비자 심리학 빠른 감정 해소 칩 5종
  const suggestions = [
    '🍕 삼겹살/피자 폭식 고백 (No-Guilt)',
    '😫 지치고 귀찮을 때 (정서적 공감)',
    '🦵 무릎 시큰거림 체크 (닥터)',
    '📅 3일 30분 뱃살 루틴 생성',
    '🍜 야식 유혹 방어 SOS',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>1:1 DEDICATED AI CARE TEAM</Text>
          <Text style={styles.headerTitle}>AI 코치 & 케어팀</Text>
        </View>
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>VIP 코칭 무제한</Text>
        </View>
      </View>

      {/* 코치 선택 가로 칩 바 (웹: coach-selector-bar) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.coachesScrollContent}
        style={styles.coachesScrollView}
      >
        {COACHES.map((coach) => {
          const isSelected = coach.id === selectedCoachId;
          const isAssigned = coach.id === assignedCoachId;
          return (
            <TouchableOpacity
              key={coach.id}
              style={[styles.coachCard, isSelected && styles.coachCardSelected]}
              onPress={() => handleSelectCoach(coach)}
              activeOpacity={0.8}
            >
              <View style={styles.coachCardTop}>
                <Text style={styles.coachEmoji}>{coach.icon}</Text>
                {isAssigned && <Text style={styles.assignedStar}>⭐</Text>}
              </View>
              <Text style={[styles.coachName, isSelected && styles.coachNameSelected]}>
                {coach.name}
              </Text>
              <Text style={styles.coachRole}>{coach.role}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ⚡ 웹 100% 일치: 활성 코치 프로필 배너 (active-coach-banner) */}
      <View style={styles.activeCoachBanner}>
        <View style={styles.activeCoachLeft}>
          <View style={styles.activeCoachAvatarCircle}>
            <Text style={{ fontSize: 24 }}>{currentCoach.icon}</Text>
          </View>
          <View style={styles.activeCoachMeta}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.activeCoachName}>{currentCoach.name}</Text>
              <View style={styles.activeCoachRoleBadge}>
                <Text style={styles.activeCoachRoleText}>{currentCoach.role}</Text>
              </View>
            </View>
            <Text style={styles.activeCoachBadgeDesc}>{currentCoach.badge}</Text>
          </View>
        </View>

        {/* 액션 버튼 그룹 (전담 지정 + 음성 토글) */}
        <View style={styles.activeCoachActions}>
          <TouchableOpacity
            style={[styles.btnAssignedAction, isCurrentlyAssigned && styles.btnAssignedActive]}
            onPress={handleSetAssigned}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnAssignedText, isCurrentlyAssigned && styles.btnAssignedActiveText]}>
              {isCurrentlyAssigned ? '✅ 전담 코치' : '⭐ 전담 지정'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnTtsAction, ttsEnabled && styles.btnTtsActive]}
            onPress={handleToggleTts}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnTtsText, ttsEnabled && styles.btnTtsActiveText]}>
              {ttsEnabled ? '🔊 음성 켜짐' : '🔇 음성 꺼짐'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 채팅 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
          {messages.map((m) => {
            const isMe = m.sender === 'user';

            return (
              <View
                key={m.id}
                style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowCoach]}
              >
                {!isMe && (
                  <View style={styles.coachAvatar}>
                    <Text style={{ fontSize: 18 }}>{currentCoach.icon}</Text>
                  </View>
                )}

                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleCoach]}>
                  {!isMe && <Text style={styles.bubbleSender}>{currentCoach.name}</Text>}
                  <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextCoach]}>
                    {m.text}
                  </Text>
                  <Text style={[styles.msgTime, isMe ? styles.msgTimeMe : styles.msgTimeCoach]}>
                    {m.time}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Google AdSense Display Slot */}
          <AdSenseBanner label="FITNESS COACH SPOTLIGHT" slot="1006" />
        </ScrollView>

        {/* 빠른 질문 추천 칩 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestChipsScroll}
          style={styles.suggestScrollView}
        >
          {suggestions.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestChip}
              onPress={() => handleSend(s)}
              activeOpacity={0.8}
            >
              <Text style={styles.suggestChipText}>💡 {s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 메시지 입력창 */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={`${currentCoach.name}에게 무엇이든 물어보세요...`}
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendBtnText}>전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgDeep,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTag: {
    ...TYPOGRAPHY.small,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  proBadgeText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.primary,
  },
  coachesScrollView: {
    maxHeight: 110,
  },
  coachesScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  coachCard: {
    width: 100,
    minHeight: 88,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  coachCardSelected: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  coachEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  coachName: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  coachNameSelected: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  coachRole: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  coachCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  assignedStar: {
    position: 'absolute',
    top: -4,
    right: 4,
    fontSize: 14,
  },
  activeCoachBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    marginHorizontal: 20,
    marginTop: 6,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.25)',
  },
  activeCoachLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activeCoachAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  activeCoachMeta: {
    flex: 1,
  },
  activeCoachName: {
    ...TYPOGRAPHY.caption,
    fontWeight: '900',
    color: '#FFFFFF',
    fontSize: 14,
  },
  activeCoachRoleBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeCoachRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  activeCoachBadgeDesc: {
    fontSize: 11,
    color: COLORS.textSub,
    marginTop: 2,
  },
  activeCoachActions: {
    flexDirection: 'column',
    gap: 6,
    alignItems: 'flex-end',
  },
  btnAssignedAction: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  btnAssignedActive: {
    backgroundColor: COLORS.secondary,
  },
  btnAssignedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  btnAssignedActiveText: {
    color: '#000000',
  },
  btnTtsAction: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  btnTtsActive: {
    borderColor: 'rgba(204, 255, 0, 0.4)',
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
  },
  btnTtsText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  btnTtsActiveText: {
    color: COLORS.primary,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
  },
  msgRowCoach: {
    justifyContent: 'flex-start',
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  coachAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bubbleCoach: {
    backgroundColor: COLORS.surfaceCard,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderTopLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 4,
  },
  bubbleSender: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  bubbleText: {
    ...TYPOGRAPHY.body,
  },
  bubbleTextCoach: {
    color: COLORS.textHigh,
  },
  bubbleTextMe: {
    color: '#000000',
    fontWeight: '600',
  },
  msgTime: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  msgTimeCoach: {
    color: COLORS.textMuted,
  },
  msgTimeMe: {
    color: 'rgba(0,0,0,0.6)',
  },
  suggestScrollView: {
    maxHeight: 44,
  },
  suggestChipsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 10,
  },
  suggestChip: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  suggestChipText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surfaceCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textHigh,
    ...TYPOGRAPHY.body,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sendBtn: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.surfaceElevated,
    opacity: 0.5,
  },
  sendBtnText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '800',
    color: '#000000',
  },
});
