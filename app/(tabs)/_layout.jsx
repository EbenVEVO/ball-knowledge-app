import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Slot, Tabs } from 'expo-router';
import { Platform } from 'react-native';

// (home), (search), (games), (collections), and (profile) are parallel groups
// that each own an index.jsx, so they're all candidate matches for the bare
// "/" route. Without this, the router breaks the tie alphabetically -
// (collections) - instead of using the tab bar's intended default.
export const unstable_settings = {
  initialRouteName: '(home)',
};

export default function TabsLayout() {
  if (Platform.OS === 'web') {
    return <Slot />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A477C7',
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Entypo name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(search)"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />      
      <Tabs.Screen
        name="(games)"
        options={{
          title: 'Games',
          tabBarIcon: ({ color, size }) => <Ionicons name="football-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(collections)"
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />

    </Tabs>
  );
}
