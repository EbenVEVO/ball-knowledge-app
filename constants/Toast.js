import { View, Text, StyleSheet } from "react-native"


export const toastConfig ={

    error: ({ text1, text2, props: customProps }) => (
    <View style={styles.customToast}>
      <View style={styles.errorCircle}>
        <Text style={styles.iconText}>{customProps?.icon ?? '!'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
    ),
    success : ({ text1, text2, props: customProps }) => (
    <View style={styles.customToast}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{customProps?.icon ?? '✓'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.text1}>{text1}</Text>
        {text2 && <Text style={styles.text2}>{text2}</Text>}
      </View>
    </View>
    ),

  
  }

  const styles = StyleSheet.create({

  text1: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  text2: {
    fontSize: 13,
    color: '#7a6fa8',
  },

  customToast: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A477C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4e4e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
});

