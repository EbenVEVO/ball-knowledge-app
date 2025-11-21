import { createMaterialTopTabNavigator,} from '@react-navigation/material-top-tabs';
import {TeamOverview} from '../screens/TeamOverview';
import {TeamSquad} from '../screens/TeamSquad';
import {TeamFixtures} from '../screens/TeamFixtures';
import {Test} from '../screens/test';
import {PlayerOverview} from '../screens/PlayerOverview';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated, Pressable} from 'react-native'
import { useWindowDimensions } from 'react-native';
import {PlayerMatches} from '../screens/PlayerMatches';
import React from 'react'

export const PlayerTopBar = ({player, club}) => {
  const {height} = useWindowDimensions();
 const Tab = createMaterialTopTabNavigator();
  return (
    <Tab.Navigator
    style={{flex: 1, height: height}}
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{lazy: false,

      
    }}
    >
        <Tab.Screen name="Overview" children={
          (props) => (<PlayerOverview {...props} player={player} club={club} />)} />  
        <Tab.Screen name="Matches" children={(props) => (<PlayerMatches {...props} player={player} />)} />
        <Tab.Screen name="Career Stats" children={(props) => (<Test {...props} />)} />
    </Tab.Navigator>
  )
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