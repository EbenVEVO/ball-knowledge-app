import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import Toast from 'react-native-toast-message'
import { verifyOTP } from '../../auth/authfunctions'

export default function Verification() {
    const { phoneNumber } = useLocalSearchParams()
    const [token, setToken] = useState(Array(6).fill(''))
    const inputRef = useRef([])
    const [isVerifying, setIsVerifying] = useState(false)

    const handleChangeText = (text, index) => {
        if (isVerifying) return
        const newToken = [...token]
        newToken[index] = text
        setToken(newToken)
        if (index < 5 && text) {
            setTimeout(() => inputRef.current[index + 1]?.focus(), 50)
        }
    }

    const handleBackspace = (index, e) => {
        if (isVerifying) return
        if (e.nativeEvent.key === 'Backspace') {
            const newToken = [...token]
            if (index > 0 && newToken[index] === '') {
                setTimeout(() => inputRef.current[index - 1].focus(), 50)
            } else {
                newToken[index] = ''
                setToken(newToken)
            }
        }
    }

    useEffect(() => {
        if (token.includes('') || isVerifying) return
        const runVerification = async () => {
            setIsVerifying(true)
            const result = await verifyOTP(phoneNumber, token.join(''))
            if (result.success) {
                // AuthGate in _layout.jsx handles navigation based on profile existence
            } else {
                Toast.show({ type: 'error', position: 'bottom', text1: result.message, visibilityTime: 3000 })
                setToken(Array(6).fill(''))
                setTimeout(() => inputRef.current[0]?.focus(), 50)
                setIsVerifying(false)
            }
        }
        runVerification()
    }, [token])
    
    const codeSentToast = () => Toast.show({ type: "success", position: 'bottom', text1: `Code sent to ${phoneNumber}` , visibilityTime: 3000});
    
    useEffect (()=>{
        if(phoneNumber){
            setTimeout(() => codeSentToast(), 100)
        }
    },[phoneNumber])
    const gradientContent = (
        <LinearGradient
            colors={['#e4daf7', '#ccbff0', '#b8ace8']}
            style={{ flex: 1 }}
        >
            <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 70, paddingBottom: 40 }}>

                {/* Top section */}
                <View style={{ flex: 1 }}>
                    <View style={{
                        alignSelf: 'flex-start',
                        backgroundColor: 'rgba(255,255,255,0.35)',
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        marginBottom: 24,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: '#4a3a7a',
                            letterSpacing: 1.5,
                            fontFamily: 'Supreme',
                        }}>VERIFY</Text>
                    </View>

                    <Text style={{
                        fontSize: 40,
                        color: '#2d1f5e',
                        marginBottom: 12,
                        fontFamily: 'SupremeExtraBold',
                    }}>Enter your code</Text>

                    <Text style={{
                        fontSize: 18,
                        color: '#5a4a8a',
                        lineHeight: 22,
                        fontFamily: 'Supreme',
                    }}>
                        We sent a 6-digit code to{' '}
                        <Text style={{ fontFamily: 'SupremeBold', color: '#2d1f5e' }}>
                            {phoneNumber}
                        </Text>.
                    </Text>
                </View>

                {/* Bottom section */}
                <View className='mb-10'>
                    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
                        {token.map((value, i) => (
                            <TextInput
                                key={i}
                                ref={ref => { if (ref) inputRef.current[i] = ref }}
                                maxLength={1}
                                value={value}
                                onChangeText={text => handleChangeText(text, i)}
                                onKeyPress={e => handleBackspace(i, e)}
                                keyboardType="number-pad"
                                selectTextOnFocus
                                editable={!isVerifying && (i === 0 || token[i - 1] !== '')}
                                style={{
                                    width: 50,
                                    height: 62,
                                    borderRadius: 14,
                                    backgroundColor: 'rgba(255,255,255,0.85)',
                                    textAlign: 'center',
                                    fontSize: 22,
                                    fontWeight: '600',
                                    color: '#2d1f5e',
                                    opacity: isVerifying ? 0.5 : 1,
                                }}
                            />
                        ))}
                    </View>

                    {isVerifying ? (
                        <ActivityIndicator color="#6b5a9e" style={{ marginBottom: 16 }} />
                    ) : (
                        <TouchableOpacity style={{ alignItems: 'center' }}>
                            <Text style={{
                                color: '#6b5a9e',
                                fontSize: 16,
                                textDecorationLine: 'underline',
                                fontFamily: 'Supreme',
                            }}>Resend code</Text>
                        </TouchableOpacity>
                    )}
                </View>

            </View>
        </LinearGradient>
    )
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            {Platform.OS === 'web' ? gradientContent : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    {gradientContent}
                </TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    )
}
