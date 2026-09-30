import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, ClipboardList, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { AssignmentsScreen } from '../screens/AssignmentsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ThemeColors } from '../types';

export type RootTabParamList = {
  HomeTab: undefined;
  CoursesTab: undefined;
  AssignmentsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

interface RootNavigatorProps {
  colors: ThemeColors;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({
  colors,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bottomNavBg,
          borderTopWidth: 0,
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 62,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
        }}
      >
        {() => (
          <HomeScreen
            colors={colors}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="CoursesTab"
        options={{
          tabBarLabel: 'Môn học',
          tabBarIcon: ({ color, size }) => <BookOpen size={size || 22} color={color} />,
        }}
      >
        {() => <CoursesScreen colors={colors} />}
      </Tab.Screen>

      <Tab.Screen
        name="AssignmentsTab"
        options={{
          tabBarLabel: 'Bài tập',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size || 22} color={color} />
          ),
        }}
      >
        {() => <AssignmentsScreen colors={colors} />}
      </Tab.Screen>

      <Tab.Screen
        name="ProfileTab"
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <User size={size || 22} color={color} />,
        }}
      >
        {() => <ProfileScreen colors={colors} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};
