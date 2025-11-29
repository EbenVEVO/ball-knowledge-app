import { StyleSheet, Text, View, Platform } from 'react-native'
import {FixtureOverview} from '../components/ui/FixtureOverview'
import {FixtureTimeline} from '../components/ui/FixtureTimeline'
import {MatchStats} from '../components/ui/MatchStats'
import {FixtureLineups} from '../components/ui/FixtureLineups'
import React, { useEffect, useState } from 'react'
import PlayerModal from './ui/PlayerModal'
import { on } from 'events'
import { usePlayerModalStore } from '../contexts/modalStore'

export const FixtureScreen = ({fixture}) => {
  const {playerModalData} = usePlayerModalStore()
  const [modalVisible, setModalVisible] = useState()
  useEffect(()=>{
    console.log(playerModalData, 'modal info')
    if(playerModalData?.isVisible){
      setModalVisible(playerModalData?.isVisible)
    }
  },[playerModalData])
  return (
    <View style={styles.container}>
      <FixtureOverview fixture = {fixture}/>
      <View className='flex flex-row  p-5  w-full  gap-5 '>
        <FixtureTimeline fixture = {fixture}/>
        <MatchStats fixture = {fixture}/>
      </View>
        <FixtureLineups fixture = {fixture}/>
        {(playerModalData?.player && playerModalData?.stats) && <PlayerModal
          isVisible={modalVisible}
          onClose={()=>setModalVisible(!modalVisible)}
          player={playerModalData.player}
          stats={playerModalData.stats}
        />}
    </View>
  )
}

export default FixtureScreen

const styles = StyleSheet.create({

   container: {
        borderRadius: Platform.select({
            ios:0,
            android:0,
            web:12,
            default:0,
        }),
        width: Platform.select({
            ios:'100%',
            android:'100%',
            web:'100%',
            default:'100%',
        }),
        minHeight: Platform.select({
            ios:'100%',
            android:'100%',
            web:'auto',
            default:'100%',
        }),
        margin: 'auto',
        paddingTop: 10,

        

    },

})