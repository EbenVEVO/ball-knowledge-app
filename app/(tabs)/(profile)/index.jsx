import { useAuth } from '@/contexts/AuthContext'
import ProfileScreen from '@/components/screens/ProfileScreen'
import SignUp from '@/app/auth/signup'
import TopNavBar from '@/components/navigation/TopNavBar'
import { View } from 'react-native'

export default function ProfileTab() {
  const { isLoggedIn, profile } = useAuth()

  return (
    <View style={{ flex: 1 }}>
      <TopNavBar title="Profile" />
      {isLoggedIn && profile?.username
        ? <ProfileScreen id={profile.username} />
        : <SignUp />}
    </View>
  )
}
