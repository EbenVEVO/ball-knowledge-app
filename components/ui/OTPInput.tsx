import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'

export default function OTPInput({tokenLength, handleSubmit}) {
    const [token, setToken] = useState(Array(tokenLength).fill(''))
    const inputRef = useRef<TextInput[]>([])

    useEffect(()=>{
        if (token.every((d) => d !== '')) {
            console.log('entering',token)
            handleSubmit(token)
            setToken(Array(tokenLength).fill(''))
        }
       
    })
    const handleBackspace = (index, e)=>{

        if(e.nativeEvent.key === 'Backspace'){
          console.log(index)
          const newToken = [...token]
          if( index > 0 && newToken[index] === '') {
            setTimeout(() => {
                inputRef.current[index-1].focus()
            }, 50);
          }
          else{          
            newToken[index] = ''

            setToken(newToken)
            console.log(newToken)
          }
          

        }
    }
    const handleChangeText =(text, index)=>{
      console.log('change')
      const newToken = [...token]
      newToken[index] = text
      setToken(newToken)
      console.log(newToken)

      if (index < token.length-1 && text){
        setTimeout(() => {
          inputRef.current[index + 1]?.focus();
        }, 50);
      }
    }


  return (
    <View style={{gap:20,flexDirection:"row", padding:15, justifyContent:"center" }}>
    
    {token.map((value,i) =>(
      <TextInput 
      ref = {ref =>{if(ref) inputRef.current[i] =ref }}
      key={i}
      maxLength={1}
      onChangeText={(input) => handleChangeText(input, i)}
      value={token[i]}
      onKeyPress={e => handleBackspace(i, e)}
      keyboardType='number-pad'
      selectTextOnFocus
      pointerEvents={(i === 0 || token[i-1] !== '') ? 'auto' : 'none'}
      editable = {i==0 || token[i-1] !== ''}
      style={styles.otpInput}/>
    ))}
    
    
  </View>
  )
}

const styles = StyleSheet.create({
    otpInput:
    {
      borderRadius:10,
      width:50,
      height:50,
      borderColor:'black',
      borderWidth: 1,
      textAlign: 'center'
    },
})