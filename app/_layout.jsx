import { useFonts } from 'expo-font';
import { Slot, Stack } from 'expo-router';
import 'react-native-reanimated';
import '../global.css'
import MenuBar from '@/components/ui/MenuBar'
import {logout} from '../auth/authfunctions'


import { useColorScheme } from '@/hooks/useColorScheme';
import { TouchableOpacity, View, Text, SafeAreaView, ScrollView } from 'react-native';
import Search from '@/components/ui/Search';
import AuthProvider from '@/providers/AuthProvider';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Supreme: require('../assets/fonts/Supreme-Medium.ttf'),
    SupremeBold: require('../assets/fonts/Supreme-Bold.ttf'),
    SupremeExtraBold: require('../assets/fonts/Supreme-Extrabold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (

    <AuthProvider>
      <SafeAreaView style={{ flex: 1 }}>
          <WebLayout/>
      </SafeAreaView>
    </AuthProvider>
  )
}
function WebLayout(){

    return(
    <View className='flex-1 h-full' >
        <View className='flex flex-row h-[100px] py-3 gap-10 p-10 justify-center items-center' style={{zIndex:10}}>
            <Text className = ' text-blue-500 font-supreme'>Ball Knowledge app</Text>
            <Search/>
            <TouchableOpacity 
              onPress={logout}
            >
              <Text>SignOut</Text>
            </TouchableOpacity>
            <View/>
        </View>
        
        <View className='flex-1 flex-row '>
          <View className='p-3'>
            <MenuBar/>
          </View>
          <div style={{ 
            height: '100%',
            flex:1,
            overflowY: 'auto',
            width: '100%',
            margin: 'auto'
          }}>
          <Slot/>
          </div>
        </View>
    </View>
    )
}



