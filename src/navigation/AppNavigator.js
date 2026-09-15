import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import QuestScreen from '../screens/QuestScreen';
import ShopScreen from '../screens/ShopScreen';
import CareTeamScreen from '../screens/CareTeamScreen';
import DietScreen from '../screens/DietScreen';
import { COLORS } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => {
            let icon = '🐾';
            if (route.name === 'Home') icon = '🐾';
            else if (route.name === 'Challenge') icon = '🏆';
            else if (route.name === 'Quest') icon = '📜';
            else if (route.name === 'Shop') icon = '⚡';
            else if (route.name === 'CareTeam') icon = '💬';
            else if (route.name === 'Diet') icon = '🥗';

            return (
              <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
                <Text style={styles.iconText}>{icon}</Text>
              </View>
            );
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            backgroundColor: COLORS.surfaceCard,
            borderTopWidth: 1,
            borderTopColor: COLORS.borderLight,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '700',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: '런고치' }} />
        <Tab.Screen name="Challenge" component={ChallengeScreen} options={{ title: '챌린지' }} />
        <Tab.Screen name="Quest" component={QuestScreen} options={{ title: '퀘스트' }} />
        <Tab.Screen name="Shop" component={ShopScreen} options={{ title: '상점' }} />
        <Tab.Screen name="CareTeam" component={CareTeamScreen} options={{ title: '케어팀' }} />
        <Tab.Screen name="Diet" component={DietScreen} options={{ title: '식단' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  iconContainerActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
  },
  iconText: {
    fontSize: 16,
  },
});
