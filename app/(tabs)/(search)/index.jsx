import Search from '@/components/ui/Search';
import TopNavBar from '@/components/navigation/TopNavBar';
import { View } from 'react-native';

export default function SearchScreen() {
  return (
    <View className='flex-1'>
      <TopNavBar title="Search" />
      <View className='flex-1 p-4'>
        <Search />
      </View>
    </View>
  );
}
