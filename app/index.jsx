import { View , Text, Pressable} from 'react-native';
import { Link } from 'expo-router';

 
export default function HomeScreen() {
 
  return (
    <View className=''>
      <Text>Home Screen</Text>

      <Link href ='/player/18' asChild>
      <Pressable className='p-5 rounded-full ' style={{backgroundColor: 'red'}}>
          <Text className='text-white'>Open Sanch</Text>
      </Pressable>
      </Link>
            <Link href ='/fixture/1374899' asChild>
      <Pressable className='p-5 rounded-full ' style={{backgroundColor: 'red'}}>
          <Text className='text-white'>Open game</Text>
      </Pressable>
      </Link>
    </View>
  );
}

