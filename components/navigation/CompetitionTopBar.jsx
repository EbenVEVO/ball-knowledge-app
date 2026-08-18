import { createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { Tabs, useFocusedTab } from 'react-native-collapsible-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLASS_ROW_HEIGHT } from '../ui/GlassIconButton';
import { FLATTENED_HEADER_HEIGHT } from './CollapsibleHeaderCrossfade';
import CompetitionKnockout from '../screens/CompetitionKnockout';
import CompetitionOverview from '../screens/CompetitionOverview';
import CompetitionSeasons from '../screens/CompetitionSeasons';
import CompetitionTable from '../screens/CompetitionTable';
import CompetitionStats from '../screens/CompetitionStats';
import CompetitionTeamStats from '../screens/CompetitionTeamStats';
import CompetitionFixtures from '../screens/CompetitionFixtures';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated, Pressable} from 'react-native'
import { useWindowDimensions } from 'react-native';
import React from 'react'

export const TopBar = ({competition, season, seasons, cup, renderHeader}) => {
  const {height} = useWindowDimensions();
 const Tab = createMaterialTopTabNavigator();
 const insets = useSafeAreaInsets();
 if (!competition) console.log('error no competition')
  else console.log(competition);

  if (Platform.OS !== 'web') {
    return (
      <Tabs.Container
        renderHeader={renderHeader}
        renderTabBar={props => <CollapsibleCustomTabBar {...props} />}
        minHeaderHeight={insets.top + GLASS_ROW_HEIGHT + FLATTENED_HEADER_HEIGHT}
      >
        <Tabs.Tab name="Overview">
          <CompetitionOverview competition={competition} season={season} />
        </Tabs.Tab>
        {competition.type !== 'Cup' &&
        <Tabs.Tab name="Table">
          <CompetitionTable competition={competition} season={season} />
        </Tabs.Tab>
        }
        {competition.type !== 'League' && (
          <Tabs.Tab name="Knockout">
            <CompetitionKnockout competition={competition} season={season} />
          </Tabs.Tab>
        )}
        <Tabs.Tab name="Player Stats">
          <CompetitionStats competition={competition} season={season} />
        </Tabs.Tab>
        <Tabs.Tab name="Team Stats">
          <CompetitionTeamStats competition={competition} season={season} />
        </Tabs.Tab>
        <Tabs.Tab name="Fixtures">
          <CompetitionFixtures competition={competition} season={season} />
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
              (props) => (<CompetitionOverview {...props} competition={competition} season={season} />)} />
             {competition.type !== 'Cup' &&<Tab.Screen name="Table" children={(props) => (<CompetitionTable {...props} competition={competition} season={season}/>)} />}
            {competition.type !== 'League' && <Tab.Screen name="Knockout" children={(props) => (<CompetitionKnockout {...props} competition={competition} season={season}/>)}/>}
            <Tab.Screen name="Player Stats" children={(props) => (<CompetitionStats {...props} competition={competition} season={season}/>)}/>
            <Tab.Screen name="Team Stats" children={(props) => (<CompetitionTeamStats {...props} competition={competition} season={season}/>)}/>
            <Tab.Screen name="Fixtures" children={(props) => (<CompetitionFixtures {...props} competition={competition} season={season}/>)}/>
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

export default TopBar

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