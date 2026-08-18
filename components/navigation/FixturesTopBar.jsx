import { createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { Tabs, useFocusedTab } from 'react-native-collapsible-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLASS_ROW_HEIGHT } from '../ui/GlassIconButton';
import { FLATTENED_HEADER_HEIGHT } from './CollapsibleHeaderCrossfade';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated, Pressable} from 'react-native'
import { useWindowDimensions } from 'react-native';
import React from 'react'
import MatchOverview from '../screens/MatchOverview';
import FixtureLineup from '../screens/FixtureLineup';
import FixtureStats from '../screens/FixtureStats';
import FixtureTable from '../screens/FixtureTable';
import FixturePreview from '../screens/FixturePreview';
import FixtureHeadToHead from '../screens/FixtureHeadToHead';
import FixtureAboutTeam from '../screens/FixtureAboutTeam';
import { isFixtureNotStarted } from '../../lib/matchStatus';

export const FixturesTopBar = ({fixture, renderHeader}) => {
  const {height} = useWindowDimensions();
 const Tab = createMaterialTopTabNavigator();
 const insets = useSafeAreaInsets();
 if (!fixture) console.log('error no fixture')
  else console.log(fixture);

  if (Platform.OS !== 'web') {
    return (
      <Tabs.Container
        renderHeader={renderHeader}
        renderTabBar={props => <CollapsibleCustomTabBar {...props} />}
        minHeaderHeight={insets.top + GLASS_ROW_HEIGHT + FLATTENED_HEADER_HEIGHT}
      >
        {!isFixtureNotStarted(fixture?.match_status) ? [
          <Tabs.Tab name="Match" key="Match">
            <MatchOverview fixture={fixture} />
          </Tabs.Tab>,
          <Tabs.Tab name="Lineup" key="Lineup">
            <FixtureLineup fixture={fixture} />
          </Tabs.Tab>,
          <Tabs.Tab name="Table" key="Table">
            <FixtureTable fixture={fixture} />
          </Tabs.Tab>,
          <Tabs.Tab name="Stats" key="Stats">
            <FixtureStats fixture={fixture} />
          </Tabs.Tab>,
        ] : [
          <Tabs.Tab name="Preview" key="Preview">
            <FixturePreview fixture={fixture} />
          </Tabs.Tab>,
          <Tabs.Tab name="Head-To-Head" key="Head-To-Head">
            <FixtureHeadToHead fixture={fixture} />
          </Tabs.Tab>,
          <Tabs.Tab name={`${fixture?.home_team.club_name}`} key="home-team">
            <FixtureAboutTeam fixture={fixture} club={fixture?.home_team} />
          </Tabs.Tab>,
          <Tabs.Tab name={`${fixture?.away_team.club_name}`} key="away-team">
            <FixtureAboutTeam fixture={fixture} club={fixture?.away_team} />
          </Tabs.Tab>,
        ]}
      </Tabs.Container>
    )
  }

  return (
    <NavigationIndependentTree>
    <NavigationContainer>
    {!isFixtureNotStarted(fixture?.match_status) ?
    <Tab.Navigator
    style={{flex: 1}}
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{lazy: true,}}>
      <Tab.Screen name="Match" children={(props) => (<MatchOverview fixture={fixture}/>)} />
      <Tab.Screen name="Lineup" children={(props) => (<FixtureLineup fixture={fixture}/>)} />
      <Tab.Screen name='Table' children={(props)=> (<FixtureTable fixture={fixture}/>)}/>
      <Tab.Screen name="Stats" children={(props) => (<FixtureStats fixture={fixture}/>)}/>
    </Tab.Navigator>
    :
    <Tab.Navigator
    style={{flex: 1}}
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{lazy: true}}>
      <Tab.Screen name="Preview" children={(props) => (<FixturePreview fixture={fixture}/>)} />
      <Tab.Screen name="Head-To-Head" children={(props) => (<FixtureHeadToHead fixture={fixture}/>)}/>
      <Tab.Screen name={`${fixture?.home_team.club_name}`} children={(props)=> (<FixtureAboutTeam fixture={fixture} club={fixture?.home_team}/>)}/>
      <Tab.Screen name={`${fixture?.away_team.club_name}`} children={(props) => (<FixtureAboutTeam fixture={fixture} club={fixture?.away_team}/>)}/>
    </Tab.Navigator>
    }
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

export default FixturesTopBar

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