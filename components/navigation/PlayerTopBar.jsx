import { createMaterialTopTabNavigator,} from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { Tabs, useFocusedTab } from 'react-native-collapsible-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLASS_ROW_HEIGHT } from '../ui/GlassIconButton';
import { FLATTENED_HEADER_HEIGHT } from './CollapsibleHeaderCrossfade';
import {TeamOverview} from '../screens/TeamOverview';
import {TeamSquad} from '../screens/TeamSquad';
import {TeamFixtures} from '../screens/TeamFixtures';
import {PlayerOverview} from '../screens/PlayerOverview';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated, Pressable} from 'react-native'
import { useWindowDimensions } from 'react-native';
import {PlayerMatches} from '../screens/PlayerMatches';
import React from 'react'
import PlayerCareerStats from '../screens/PlayerCareerStats';

export const PlayerTopBar = ({player, club, renderHeader}) => {
  const {height} = useWindowDimensions();
 const Tab = createMaterialTopTabNavigator();
 const insets = useSafeAreaInsets();

  if (Platform.OS !== 'web') {
    return (
      <Tabs.Container
        renderHeader={renderHeader}
        renderTabBar={props => <CollapsibleCustomTabBar {...props} />}
        minHeaderHeight={insets.top + GLASS_ROW_HEIGHT + FLATTENED_HEADER_HEIGHT}
      >
        <Tabs.Tab name="Overview">
          <PlayerOverview player={player} club={club} />
        </Tabs.Tab>
        <Tabs.Tab name="Matches">
          <PlayerMatches player={player} />
        </Tabs.Tab>
        <Tabs.Tab name="Career Stats">
          <PlayerCareerStats player={player} />
        </Tabs.Tab>
      </Tabs.Container>
    )
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Tab.Navigator
        style={{flex: 1}}
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{lazy: true,


        }}
        >
            <Tab.Screen name="Overview" children={
              (props) => (<PlayerOverview {...props} player={player} club={club} />)} />
            <Tab.Screen name="Matches" children={(props) => (<PlayerMatches {...props} player={player} />)} />
            <Tab.Screen name="Career Stats" children={(props) => (<PlayerCareerStats player={player} {...props} />)} />
        </Tab.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  )
}

const CollapsibleCustomTabBar = ({ tabNames, onTabPress }) => {
  const focusedTab = useFocusedTab()

  return (
    <View style={styles.tabContainer}>
      {tabNames.map((name) => {
        const isFocused = focusedTab === name

        return (
          <Pressable
            key={name}
            accessibilityRole={'button'}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={() => onTabPress(name)}
            style={styles.tabItem}
          >
            <Text style={[styles.tabBarLabel, {fontFamily: 'supreme'}, isFocused ? {color: 'blue'} : {color: 'black'}]}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const CustomTabBar = ({ state, descriptors, navigation, position}) => {
    return (
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.jumpTo(route.name);
          }
        };


        const inputRange = state.routes.map((_, i) => i);
        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map((i) => (i === index ? 1 : 0)),
        });

        return (
          <Pressable
            key={route.key}
            accessibilityRole={'button'}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Text style={[styles.tabBarLabel, {fontFamily: 'supreme'}, isFocused ? {color: 'blue'} : {color: 'black'}]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
      </View>
    );
  };

export default PlayerTopBar

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        width: Platform.select({
            ios:'100%',
            android:'100%',
            web:'75%',
            default:'100%',
        }), 
        margin: 'auto',
    },
    tabBarLabel: {
        fontSize: Platform.select({
            ios: 10,
            android: 10,
            web: 16,
        }),
        color: 'black',
      },    
    tabItem:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:25,
        backgroundColor:'white',
        marginHorizontal:Platform.select({
            ios: 5,
            android: 5,
            web: 10,
        }),
        paddingVertical:10,

    
    }

})