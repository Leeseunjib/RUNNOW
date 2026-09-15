import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { CHALLENGE_CHAPTERS, CHALLENGE_DAYS } from '../core/challenge';
import AdSenseBanner from '../components/AdSenseBanner';

export default function ChallengeScreen() {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [completedDays, setCompletedDays] = useState([1, 2, 3, 4, 5]); // Day 1~5 완료 상태 예시

  const currentChapter = CHALLENGE_CHAPTERS.find((c) => c.week === selectedWeek) || CHALLENGE_CHAPTERS[0];
  const filteredDays = CHALLENGE_DAYS.filter((d) => d.week === selectedWeek);

  const toggleDayCompletion = (day) => {
    if (completedDays.includes(day)) {
      setCompletedDays((prev) => prev.filter((d) => d !== day));
    } else {
      setCompletedDays((prev) => [...prev, day]);
      const dayData = CHALLENGE_DAYS.find((d) => d.day === day);
      Alert.alert(
        '🎉 챌린지 미션 달성!',
        `Day ${day}: ${dayData.title} 완료!\n\n보상 획득:\n+${dayData.xpReward} XP\n+${dayData.coinReward} VC`,
        [{ text: '확인' }]
      );
    }
  };

  const progressPercent = Math.round((completedDays.length / 21) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />

      {/* 헤더 허브 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>21-DAY HABIT CHALLENGE</Text>
          <Text style={styles.headerTitle}>3주 러닝 습관 챌린지</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{completedDays.length}일 완료</Text>
        </View>
      </View>

      {/* 진행 상황 게이지 카드 */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>전체 완주 달성률</Text>
          <Text style={styles.progressPercentText}>{progressPercent}% ({completedDays.length}/21일)</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* 주차(챕터) 탭 셀렉터 */}
      <View style={styles.weekTabsRow}>
        {[1, 2, 3].map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.weekTab, selectedWeek === w && styles.weekTabActive]}
            onPress={() => setSelectedWeek(w)}
            activeOpacity={0.8}
          >
            <Text style={[styles.weekTabText, selectedWeek === w && styles.weekTabTextActive]}>
              {w}주차 (Day {(w - 1) * 7 + 1}~{w * 7})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 챕터 상세 카드 */}
        <View style={styles.chapterCard}>
          <Text style={styles.chapterTitle}>{currentChapter.chapterTitle}</Text>
          <Text style={styles.chapterDesc}>{currentChapter.chapterDesc}</Text>
          <View style={styles.chapterRewardBox}>
            <Text style={styles.rewardIcon}>🎁</Text>
            <Text style={styles.chapterRewardText}>{currentChapter.rewardSummary}</Text>
          </View>
        </View>

        {/* 일일 미션 리스트 */}
        <View style={styles.daysList}>
          {filteredDays.map((item) => {
            const isDone = completedDays.includes(item.day);

            return (
              <View
                key={item.day}
                style={[
                  styles.dayCard,
                  isDone && styles.dayCardDone,
                  item.isMilestone && styles.dayCardMilestone,
                ]}
              >
                <View style={styles.dayTopRow}>
                  <View style={styles.dayNumBadge}>
                    <Text style={styles.dayNumText}>DAY {item.day}</Text>
                  </View>
                  <View style={styles.kmBadge}>
                    <Text style={styles.kmBadgeText}>{item.targetKm} km 목표</Text>
                  </View>
                  {item.isMilestone && (
                    <View style={styles.milestoneTag}>
                      <Text style={styles.milestoneTagText}>👑 챕터 보스</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.dayTitle}>{item.title}</Text>
                <Text style={styles.dayDesc}>{item.desc}</Text>

                <View style={styles.dayBottomRow}>
                  <View style={styles.rewardsRow}>
                    <Text style={styles.rewardPill}>+{item.xpReward} XP</Text>
                    <Text style={styles.rewardPill}>+{item.coinReward} VC</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.completeBtn, isDone && styles.completeBtnDone]}
                    onPress={() => toggleDayCompletion(item.day)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.completeBtnText, isDone && styles.completeBtnTextDone]}>
                      {isDone ? '완료됨 ✓' : '미션 완료 체크'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Google AdSense Display Slot */}
        <AdSenseBanner label="CHALLENGE SPONSOR" slot="1002" />
      </ScrollView>
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakCount: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.accent,
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  progressPercentText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '900',
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
  weekTabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  weekTab: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  weekTabActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderSubtle,
  },
  weekTabText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  weekTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  chapterCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 16,
  },
  chapterTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 6,
  },
  chapterDesc: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    marginBottom: 12,
  },
  chapterRewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    padding: 10,
    borderRadius: 12,
    gap: 8,
  },
  rewardIcon: {
    fontSize: 16,
  },
  chapterRewardText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textHigh,
    flex: 1,
  },
  daysList: {
    gap: 12,
  },
  dayCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  dayCardDone: {
    borderColor: 'rgba(0, 230, 118, 0.3)',
    backgroundColor: 'rgba(18, 22, 31, 0.6)',
  },
  dayCardMilestone: {
    borderColor: 'rgba(255, 193, 7, 0.4)',
  },
  dayTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dayNumBadge: {
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dayNumText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textHigh,
  },
  kmBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kmBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  milestoneTag: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  milestoneTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD54F',
  },
  dayTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginBottom: 4,
  },
  dayDesc: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    marginBottom: 12,
  },
  dayBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  rewardPill: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completeBtn: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  completeBtnDone: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  completeBtnText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: '#000000',
  },
  completeBtnTextDone: {
    color: COLORS.success,
  },
});
