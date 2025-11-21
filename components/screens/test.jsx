import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native'
import React, {useRef} from 'react'
import { useScrollToTop } from '@react-navigation/native'
import { useWindowDimensions } from 'react-native';
export const Test = () => {
    const ref = useRef(null);
    useScrollToTop(ref); 
    const {height} = useWindowDimensions();
        if (Platform.OS === 'web') {
        return (
            <div style={{ 
                height:height - 350,
                overflowY: 'auto',
                width: '100%'
            }}>
                {Array.from({length: 50}, (_, i) => (
                    <div key={i} style={{
                        padding: '20px',
                        margin: '5px',
                        backgroundColor: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0'
                    }}>
                        Test content line {i + 1} - This should be scrollable on web
                    </div>
                ))}
            </div>
        );
    }
    
  return (
               
        <ScrollView 
          style={{ height: height - 100}}
          contentContainerStyle={{  paddingBottom: 10 }}
         ref={ref}
         scrollEnabled
         >
    <View>
      {Array.from({length: 20}, (_, i) => (
          <Text key={i} style={{padding: 10, backgroundColor: i % 2 === 0 ? '#f0f0f0' : '#e0e0e0'}}>
            Test content line {i + 1} - This should be scrollable on \
          </Text>
        ))}
    </View>
    </ScrollView>
  )
}

export default Test

const styles = StyleSheet.create({})