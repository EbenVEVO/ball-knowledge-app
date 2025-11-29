import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const MenuBar = () => {
    const {session, profile} = useAuth()


    const menuItems = [
        {name: 'Home', path: '/', icon: ()=>(<Entypo name="home" size={24} color="black" />)},
        {name: 'Notifications', path:'', icon: ()=>(<Ionicons name="notifications" size={24} color="black" />)},
        {name: 'Collections', path:'', icon: ()=>(<MaterialCommunityIcons name="cards" size={24} color="black" />)},
        {name: 'Community Trends', path: '', icon: ()=>(<MaterialIcons name="local-fire-department" size={24} color="black" />)},
       session ? {name:'Profile', path:`/profile/${profile?.username}`, icon:()=>(<Ionicons name="person-circle-outline" size={24} color="black" />)} : {name:'Sign In/Up', path: '/auth/signup', icon:()=>(<Ionicons name="person-circle-outline" size={24} color="black" />)},
        {name:'More', path: '', icon:()=>(<Feather name="more-horizontal" size={24} color="black" />
        )}
    ]
  return (
    <View className=''>
        <View className = 'rounded-xl shadow-lg ' style={{width: '100%'}}>
            {menuItems.map((item, index)=>(
                <View key={index} className='p-5 justify-center'>
                    <Link asChild href={item.path}>
                    <TouchableOpacity className='flex flex-row gap-5 items-center'>
                        <View style={{width:25}}>
                        {item.icon()}
                        </View>
                        <Text>{item.name}</Text>
                    </TouchableOpacity>
                    </Link>
                </View>
            ))}
        </View>
    </View>
  )
}

export default MenuBar