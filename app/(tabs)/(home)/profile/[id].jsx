import { useLocalSearchParams } from 'expo-router'
import ProfileScreen from '@/components/screens/ProfileScreen'

export default function ProfileRoute() {
  const { id } = useLocalSearchParams()
  return <ProfileScreen id={id} />
}
