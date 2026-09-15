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
import AdSenseBanner from '../components/AdSenseBanner';

export default function DietScreen() {
  const [waterMl, setWaterMl] = useState(1750);
  const targetWater = 2500;

  const [meals, setMeals] = useState([
    { id: 1, type: '아침', time: '08:20', name: '그릭 요거트 & 블루베리, 통밀빵', kcal: 380, icon: '🌅' },
    { id: 2, type: '점심', time: '12:40', name: '현미밥 + 소고기 우둔살 150g + 구운 야채', kcal: 650, icon: '☀️' },
    { id: 3, type: '저녁', time: '18:50', name: '단호박 닭가슴살 샐러드 + 아보카도', kcal: 420, icon: '🌙' },
  ]);

  const totalConsumedKcal = meals.reduce((sum, m) => sum + m.kcal, 0);
  const burnKcal = 450; // 러닝으로 소모한 칼로리
  const targetKcal = 2100;
  const remainKcal = targetKcal - totalConsumedKcal + burnKcal;

  const handleAddWater = () => {
    setWaterMl((prev) => {
      const next = Math.min(targetWater, prev + 250);
      Alert.alert('💧 수분 충전 완료!', `+250ml 보충! (현재 ${next}ml / 목표 ${targetWater}ml)`);
      return next;
    });
  };

  const handleAddMeal = () => {
    Alert.prompt
      ? Alert.prompt('새 식사 기록', '음식 이름과 칼로리를 입력하세요', (text) => {
          if (text) {
            setMeals((prev) => [
              ...prev,
              { id: Date.now(), type: '간식', time: '방금', name: text, kcal: 200, icon: '🍎' },
            ]);
          }
        })
      : Alert.alert('식사 기록 추가', '새 식단 항목이 추가되었습니다.', [
          {
            text: '단백질 쉐이크 (+180 kcal)',
            onPress: () => {
              setMeals((prev) => [
                ...prev,
                { id: Date.now(), type: '간식', time: '방금', name: '단백질 쉐이크 1회분', kcal: 180, icon: '🥤' },
              ]);
            },
          },
          { text: '취소', style: 'cancel' },
        ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>SMART NUTRITION & MACROS</Text>
          <Text style={styles.headerTitle}>맞춤 식단 & 영양 분석</Text>
        </View>
        <View style={styles.vipBadge}>
          <Text style={styles.vipBadgeText}>VIP 식단 솔루션</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 칼로리 밸런스 요약 카드 */}
        <View style={styles.calorieCard}>
          <Text style={styles.cardTitle}>🔥 오늘의 칼로리 밸런스</Text>

          <View style={styles.calorieStatsRow}>
            <View style={styles.calorieCol}>
              <Text style={styles.calorieLabel}>목표 섭취</Text>
              <Text style={styles.calorieVal}>{targetKcal}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>

            <Text style={styles.operatorSign}>-</Text>

            <View style={styles.calorieCol}>
              <Text style={styles.calorieLabel}>현재 섭취</Text>
              <Text style={[styles.calorieVal, { color: COLORS.accent }]}>{totalConsumedKcal}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>

            <Text style={styles.operatorSign}>+</Text>

            <View style={styles.calorieCol}>
              <Text style={styles.calorieLabel}>운동 소모</Text>
              <Text style={[styles.calorieVal, { color: COLORS.primary }]}>{burnKcal}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>

            <Text style={styles.operatorSign}>=</Text>

            <View style={styles.calorieCol}>
              <Text style={styles.calorieLabel}>잔여 가능</Text>
              <Text style={[styles.calorieVal, { color: COLORS.secondary }]}>{remainKcal}</Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </View>

          {/* AI 영양사 코멘트 */}
          <View style={styles.aiAdviceBox}>
            <Text style={styles.aiAdviceIcon}>🥗</Text>
            <Text style={styles.aiAdviceText}>
              엘리 코치: "오늘 러닝으로 {burnKcal}kcal를 시원하게 태우셨어요! 저녁에 단백질 30g 위주로 보충하시면 근손실 없이 지방이 연소됩니다."
            </Text>
          </View>
        </View>

        {/* 3대 영양소 매크로 게이지 */}
        <View style={styles.macroCard}>
          <Text style={styles.cardTitle}>⚖️ 3대 영양소 섭취 비율</Text>

          <View style={styles.macroItem}>
            <View style={styles.macroLabelRow}>
              <Text style={styles.macroName}>탄수화물 (Carbs)</Text>
              <Text style={styles.macroAmount}>165g / 220g (75%)</Text>
            </View>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, { width: '75%', backgroundColor: '#FFB300' }]} />
            </View>
          </View>

          <View style={styles.macroItem}>
            <View style={styles.macroLabelRow}>
              <Text style={styles.macroName}>단백질 (Protein)</Text>
              <Text style={styles.macroAmount}>112g / 130g (86%)</Text>
            </View>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, { width: '86%', backgroundColor: COLORS.primary }]} />
            </View>
          </View>

          <View style={styles.macroItem}>
            <View style={styles.macroLabelRow}>
              <Text style={styles.macroName}>지방 (Fat)</Text>
              <Text style={styles.macroAmount}>44g / 55g (80%)</Text>
            </View>
            <View style={styles.macroBarBg}>
              <View style={[styles.macroBarFill, { width: '80%', backgroundColor: COLORS.secondary }]} />
            </View>
          </View>
        </View>

        {/* 수분 섭취 트래커 */}
        <View style={styles.waterCard}>
          <View style={styles.waterTopRow}>
            <View>
              <Text style={styles.cardTitle}>💧 수분 섭취 트래커</Text>
              <Text style={styles.waterSubText}>
                {waterMl} ml / {targetWater} ml ({Math.round((waterMl / targetWater) * 100)}%)
              </Text>
            </View>
            <TouchableOpacity style={styles.addWaterBtn} onPress={handleAddWater} activeOpacity={0.8}>
              <Text style={styles.addWaterBtnText}>+250ml 기록</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.macroBarBg}>
            <View
              style={[
                styles.macroBarFill,
                { width: `${(waterMl / targetWater) * 100}%`, backgroundColor: COLORS.secondary },
              ]}
            />
          </View>
        </View>

        {/* 식사 타임라인 */}
        <View style={styles.mealsHeaderRow}>
          <Text style={styles.cardTitle}>🍽️ 오늘의 식단 타임라인</Text>
          <TouchableOpacity onPress={handleAddMeal} activeOpacity={0.8}>
            <Text style={styles.addMealLink}>+ 식사 추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealsList}>
          {meals.map((m) => (
            <View key={m.id} style={styles.mealCard}>
              <View style={styles.mealLeft}>
                <View style={styles.mealIconBox}>
                  <Text style={styles.mealEmoji}>{m.icon}</Text>
                </View>
                <View style={styles.mealInfoCol}>
                  <View style={styles.mealTagRow}>
                    <Text style={styles.mealTypeTag}>{m.type}</Text>
                    <Text style={styles.mealTimeText}>{m.time}</Text>
                  </View>
                  <Text style={styles.mealNameText}>{m.name}</Text>
                </View>
              </View>

              <View style={styles.mealKcalBox}>
                <Text style={styles.mealKcalVal}>{m.kcal}</Text>
                <Text style={styles.mealKcalUnit}>kcal</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Google AdSense Display Slot */}
        <AdSenseBanner label="NUTRITION & HEALTH SPONSOR" slot="1005" />
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
  vipBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  vipBadgeText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  cardTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginBottom: 12,
  },
  calorieCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  calorieStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieCol: {
    alignItems: 'center',
  },
  calorieLabel: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    marginBottom: 4,
  },
  calorieVal: {
    ...TYPOGRAPHY.h3,
    fontWeight: '900',
    color: COLORS.textHigh,
  },
  calorieUnit: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  operatorSign: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '900',
    color: COLORS.textMuted,
    marginTop: 10,
  },
  aiAdviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 8,
  },
  aiAdviceIcon: {
    fontSize: 20,
  },
  aiAdviceText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    lineHeight: 18,
    flex: 1,
  },
  macroCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 12,
  },
  macroItem: {
    gap: 6,
  },
  macroLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroName: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
    fontWeight: '600',
  },
  macroAmount: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.textHigh,
  },
  macroBarBg: {
    height: 8,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  waterCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: 12,
  },
  waterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterSubText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: -8,
  },
  addWaterBtn: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  addWaterBtnText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  mealsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  addMealLink: {
    ...TYPOGRAPHY.caption,
    fontWeight: '800',
    color: COLORS.primary,
    padding: 8,
  },
  mealsList: {
    gap: 10,
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  mealIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealEmoji: {
    fontSize: 20,
  },
  mealInfoCol: {
    flex: 1,
  },
  mealTagRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginBottom: 2,
  },
  mealTypeTag: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mealTimeText: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  mealNameText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textHigh,
  },
  mealKcalBox: {
    alignItems: 'flex-end',
  },
  mealKcalVal: {
    ...TYPOGRAPHY.bodyBold,
    fontWeight: '900',
    color: COLORS.textHigh,
  },
  mealKcalUnit: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
