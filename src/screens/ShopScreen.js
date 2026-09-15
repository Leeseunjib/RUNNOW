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
import { SHOP_ITEMS } from '../core/catalog';
import AdSenseBanner from '../components/AdSenseBanner';

export default function ShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userCoins, setUserCoins] = useState(1480);
  const [purchasedItems, setPurchasedItems] = useState([]);

  const categories = [
    { id: 'all', name: '전체 보기' },
    { id: 'shoes', name: '👟 러닝화' },
    { id: 'energy', name: '🧪 에너지/회복' },
    { id: 'skin', name: '👕 스킨/코스튬' },
    { id: 'gear', name: '⌚ 웨어러블' },
    { id: 'pass', name: '👑 패스/부스터' },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === selectedCategory);

  const handleBuyItem = (item) => {
    if (userCoins < item.voltCoins) {
      Alert.alert('볼트코인 부족!', `이 아이템을 구매하려면 ${item.voltCoins} VC가 필요합니다.\n러닝을 완료하여 코인을 모아보세요!`);
      return;
    }

    Alert.alert(
      '🛒 아이템 구매 확인',
      `[${item.name}]\n가격: ${item.voltCoins} VC\n\n구매하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '구매하기',
          onPress: () => {
            setUserCoins((prev) => prev - item.voltCoins);
            setPurchasedItems((prev) => [...prev, item.id]);
            Alert.alert('🎉 구매 완료!', `"${item.name}"을(를) 획득했습니다!\n적용 효과: ${item.bonus}`);
          },
        },
      ]
    );
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return '#FFD700'; // 골드
      case 'Epic':
        return '#BB86FC'; // 퍼플
      case 'Rare':
        return COLORS.secondary; // 사이안
      default:
        return COLORS.textSub;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDeep} />

      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTag}>VOLT GEAR & POWER-UPS</Text>
          <Text style={styles.headerTitle}>볼트 상점 (VOLT SHOP)</Text>
        </View>
        <View style={styles.coinBalanceBox}>
          <Text style={styles.coinIcon}>⚡</Text>
          <Text style={styles.coinVal}>{userCoins.toLocaleString()} VC</Text>
        </View>
      </View>

      {/* 카테고리 필터 스크롤 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catScrollContent}
        style={styles.catScrollView}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catPill, selectedCategory === cat.id && styles.catPillActive]}
            onPress={() => setSelectedCategory(cat.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.catPillText, selectedCategory === cat.id && styles.catPillTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 상점 안내 카드 */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>⚡ 러닝으로 번 볼트코인으로 무장하세요</Text>
          <Text style={styles.bannerDesc}>
            모든 아이템은 러닝 기록 향상 및 다마고치 육성 속도에 실시간 보너스를 제공합니다.
          </Text>
        </View>

        {/* 아이템 2열 그리드 */}
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => {
            const isOwned = purchasedItems.includes(item.id);
            const rarityColor = getRarityColor(item.rarity);

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemCardTop}>
                  <View style={[styles.rarityBadge, { borderColor: rarityColor }]}>
                    <Text style={[styles.rarityText, { color: rarityColor }]}>{item.rarity}</Text>
                  </View>
                  <Text style={styles.itemCategoryText}>{item.categoryName}</Text>
                </View>

                {/* 아이콘 아바타 */}
                <View style={styles.itemIconContainer}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                </View>

                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemBonus} numberOfLines={2}>
                  {item.bonus}
                </Text>

                {/* 가격 및 구매 버튼 */}
                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.priceCoins}>⚡ {item.voltCoins} VC</Text>
                    <Text style={styles.priceKrw}>₩{item.priceKRW?.toLocaleString()}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.buyBtn, isOwned && styles.buyBtnOwned]}
                    onPress={() => handleBuyItem(item)}
                    disabled={isOwned}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buyBtnText, isOwned && styles.buyBtnTextOwned]}>
                      {isOwned ? '보유중 ✓' : '구매'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Google AdSense Display Slot */}
        <AdSenseBanner label="GEAR BRAND SPOTLIGHT" slot="1004" />
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
  coinBalanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  coinIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  coinVal: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.primary,
  },
  catScrollView: {
    maxHeight: 52,
  },
  catScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 8,
  },
  catPill: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  catPillActive: {
    backgroundColor: COLORS.surfaceElevated,
    borderColor: COLORS.borderSubtle,
  },
  catPillText: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  catPillTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    marginBottom: 16,
  },
  bannerTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  bannerDesc: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSub,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    justifyContent: 'space-between',
  },
  itemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  itemCategoryText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  itemIconContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  itemIcon: {
    fontSize: 38,
  },
  itemName: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: COLORS.textHigh,
    marginBottom: 4,
  },
  itemBonus: {
    ...TYPOGRAPHY.small,
    fontSize: 10,
    color: COLORS.textSub,
    marginBottom: 12,
    height: 32,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 10,
  },
  priceCoins: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },
  priceKrw: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  buyBtn: {
    minHeight: 48,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  buyBtnOwned: {
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  buyBtnText: {
    ...TYPOGRAPHY.small,
    fontWeight: '800',
    color: '#000000',
  },
  buyBtnTextOwned: {
    color: COLORS.success,
  },
});
