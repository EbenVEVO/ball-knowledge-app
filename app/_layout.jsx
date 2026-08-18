import AuthRequiredModal from '@/components/ui/AuthRequiredModal';
import NotificationPermissionModal from '@/components/ui/NotificationPermissionModal';
import MenuBar from '@/components/ui/MenuBar';
import { useNotificationPermissionSync } from '@/hooks/useNotificationPermissionSync';
import { useFonts } from 'expo-font';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { logout } from '../auth/authfunctions';
import '../global.css';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/constants/Toast';


import Search from '@/components/ui/Search';
import { useColorScheme } from '@/hooks/useColorScheme';
import AuthProvider from '@/providers/AuthProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';


// Screens whose own header bleeds its background color up behind the status
// bar - the root SafeAreaView must not also reserve that space for them, or
// there'd be no way for their header to actually paint behind the notch.
const BLEEDS_OWN_TOP_INSET = /^\/(player|club|competition|fixture)\//

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Supreme: require('../assets/fonts/Supreme-Medium.ttf'),
    SupremeBold: require('../assets/fonts/Supreme-Bold.ttf'),
    SupremeExtraBold: require('../assets/fonts/Supreme-Extrabold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const edges = BLEEDS_OWN_TOP_INSET.test(pathname) ? ['left', 'right'] : ['top', 'left', 'right']

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGate>
          <SafeAreaView style={{ flex: 1}} edges={edges}>
            {Platform.OS === 'web' ?
              <WebLayout/>:
              <MobileLayout/>
              }
          </SafeAreaView>
        </AuthGate>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
function AuthGate({ children }) {
  const { session, profile, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (session && profile === undefined) return
    if (session && profile === null && pathname !== '/auth/completeprofile') {
      router.replace('/auth/completeprofile')
    }
    if (session && profile && pathname.startsWith('/auth/')) {
      router.replace('/(tabs)')
    }
    if (!session && pathname === '/auth/completeprofile') {
      router.replace('/auth/signup')
    }
  }, [session, profile, isLoading, pathname])

  if (isLoading) return null

  return children
}

function WebLayout(){
    const { session } = useAuth()
    const router = useRouter()

    return(
    <View className='flex-1 h-full' >
        <View className='flex flex-row h-[100px] py-3 gap-10 p-10 justify-center items-center' style={{zIndex:10}}>
            <Image
              source={require('../assets/images/logo.png')}
              style={{ height: 40, width: 155 }}
              resizeMode='contain'
            />
            <Search/>
            <TouchableOpacity
              onPress={() => session ? logout() : router.push('/auth/signin')}
            >
              <Text>{session ? 'Sign Out' : 'Sign In'}</Text>
            </TouchableOpacity>
            <View/>
        </View>
        
        <View className='flex-1 flex-row ' style={{padding:10, gap:10}}>
          <View className=''>
            <MenuBar/>
          </View>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            flex:1,
            overflowY: 'auto',
            width: '100%',
            margin: 'auto'
          }}>
          <Slot/>
          </div>
        </View>
      <AuthRequiredModal/>
      <Toast config={toastConfig} />
    </View>
    )
}

function MobileLayout(){
  const router = useRouter();
  const pathname = usePathname();
  const isRoot = pathname === '/' || pathname === '/index' || pathname === '/auth/completeprofile';
  useNotificationPermissionSync();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Slot />
        <AuthRequiredModal/>
        <NotificationPermissionModal/>
      </BottomSheetModalProvider>
      <Toast bottomOffset={-1} config={toastConfig} />
    </GestureHandlerRootView>
  );
}



