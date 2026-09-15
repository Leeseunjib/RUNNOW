import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../theme/colors';

/**
 * AdSenseBanner 컴포넌트
 * - 웹 브라우저(Platform.OS === 'web')에서는 실제 구글 애드센스 슬롯 또는 나이키/스포츠 스폰서 배너 렌더링
 * - 모바일 앱(iOS/Android)에서는 추후 구글 애드몹(AdMob) 배너로 자동 스위칭
 */
export default function AdSenseBanner({ label = 'SPONSOR SPOTLIGHT', slot = '1234567890' }) {
  return (
    <View style={styles.adContainer}>
      <View style={styles.adHeader}>
        <Text style={styles.adTag}>{label}</Text>
        <Text style={styles.adMark}>Google AdSense</Text>
      </View>

      <View style={styles.adContentBox}>
        <View style={styles.adBrandRow}>
          <Text style={styles.adIcon}>⚡</Text>
          <Text style={styles.adBrandName}>나이키 공식 파트너십</Text>
        </View>
        <Text style={styles.adTitle}>에어 줌 페가수스 41 러닝화 에디션</Text>
        <Text style={styles.adDesc}>
          더 가볍고 완벽해진 반응성 쿠셔닝. 오늘 달린 기록을 나이키 멤버십과 연동해 보세요.
        </Text>
        <View style={styles.adFooterRow}>
          <Text style={styles.adCta}>공식 스토어 혜택 보러가기 ➔</Text>
          <View style={styles.badgeAd}>
            <Text style={styles.badgeAdText}>AD</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  adContainer: {
    marginVertical: 14,
    backgroundColor: 'rgba(18, 22, 31, 0.85)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(204, 255, 0, 0.18)',
    overflow: 'hidden',
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adTag: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  adMark: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  adContentBox: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  adBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  adIcon: {
    fontSize: 12,
  },
  adBrandName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  adTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginBottom: 4,
  },
  adDesc: {
    fontSize: 11,
    color: COLORS.textSub,
    lineHeight: 16,
    marginBottom: 8,
  },
  adFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 8,
  },
  adCta: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  badgeAd: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeAdText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
