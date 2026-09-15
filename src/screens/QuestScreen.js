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
import { DAILY_QUESTS, WEEKLY_QUESTS } from '../core/quests';
import AdSenseBanner from '../components/AdSenseBanner';

export default function QuestScreen() {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly'
  const [claimedQuests, setClaimedQuests] = useState(['dq_01']); // 기수령 목록 예시

  const questList = activeTab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;

  const handleClaim = (quest) => {
    if (claimedQuests.includes(quest.id)) return;

    setClaimedQuests((prev) => [...prev, quest.id]);
    Alert.alert(
      '🎁 퀘스트 보상 수령 완료!',
      `"${quest.title}" 달성 보상:\n+${quest.coinReward} VC (볼트코인)\n+${quest.xpReward} XP (다마고치 경험치)`,
      [{ text: '확인' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>DAILY & WEEKLY MISSIONS</Text>
          <Text style={styles.headerTitle}>퀘스트 & 미션 센터</Text>
        </View>
        <View style={styles.rewardSummaryBadge}>
          <Text style={styles.rewardSummaryIcon}>💎</Text>
          <Text style={styles.rewardSummaryText}>수령 완료 {claimedQuests.length}개</Text>
        </View>
      </View>

      {/* 탭 토글 */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'daily' && styles.tabBtnActive]}
          onPress={() => setActiveTab('daily')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'daily' && styles.tabBtnTextActive]}>
            ☀️ 일일 퀘스트 ({DAILY_QUESTS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'weekly' && styles.tabBtnActive]}
          onPress={() => setActiveTab('weekly')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabBtnText, activeTab === 'weekly' && styles.tabBtnTextActive]}>
            📅 주간 퀘스트 ({WEEKLY_QUESTS.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 리셋 안내 배너 */}
        <View style={styles.resetNoticeCard}>
          <Text style={styles.resetNoticeIcon}>⏳</Text>
          <Text style={styles.resetNoticeText}>
            {activeTab === 'daily'
              ? '일일 퀘스트는 매일 밤 12시(자정)에 새로운 보상으로 초기화됩니다.'
              : '주간 퀘스트는 매주 월요일 00:00에 갱신됩니다. 큰 보상을 노려보세요!'}
          </Text>
        </View>

        {/* 퀘스트 리스트 */}
        <View style={styles.questList}>
          {questList.map((q) => {
            const isClaimed = claimedQuests.includes(q.id);

            return (
              <View key={q.id} style={[styles.questCard, isClaimed && styles.questCardClaimed]}>
                <View style={styles.questTopRow}>
                  <View style={styles.questIconBox}>
                    <Text style={styles.questEmoji}>{q.icon || '🏃'}</Text>
                  </View>

                  <View style={styles.questInfoCol}>
                    <Text style={styles.questTitle}>{q.title}</Text>
                    <Text style={styles.questDesc}>{q.desc}</Text>
                  </View>
                </View>

                {/* 게이지 및 보상 수령 바 */}
                <View style={styles.questBottomRow}>
                  <View style={styles.rewardBadges}>
                    <View style={styles.coinBadge}>
                      <Text style={styles.coinBadgeText}>+{q.coinReward} VC</Text>
                    </View>
                    <View style={styles.xpBadge}>
                      <Text style={styles.xpBadgeText}>+{q.xpReward} XP</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.claimBtn, isClaimed && styles.claimBtnDone]}
                    onPress={() => handleClaim(q)}
                    disabled={isClaimed}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.claimBtnText, isClaimed && styles.claimBtnTextDone]}>
                      {isClaimed ? '수령 완료 ✓' : '보상 받기'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Google AdSense Display Slot */}
        <AdSenseBanner label="QUEST REWARD SPONSOR" slot="1003" />
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
  rewardSummaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  rewardSummaryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  rewardSummaryText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  tabBtn: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  tabBtnText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  resetNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    marginBottom: 16,
    gap: 8,
  },
  resetNoticeIcon: {
    fontSize: 16,
  },
  resetNoticeText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    flex: 1,
  },
  questList: {
    gap: 12,
  },
  questCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  questCardClaimed: {
    opacity: 0.6,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  questTopRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  questIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  questEmoji: {
    fontSize: 22,
  },
  questInfoCol: {
    flex: 1,
  },
  questTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginBottom: 4,
  },
  questDesc: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
  },
  questBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  rewardBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  coinBadge: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coinBadgeText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.primary,
  },
  xpBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  xpBadgeText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  claimBtn: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  claimBtnDone: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  claimBtnText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: '#000000',
  },
  claimBtnTextDone: {
    color: COLORS.success,
  },
});
