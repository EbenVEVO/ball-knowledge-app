import { Modal as RNModal, StyleSheet, Text, View, Image, TouchableWithoutFeedback, Platform } from 'react-native'
import React, { useEffect, useMemo, useRef } from 'react'
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet'
import Comments from '../screens/Comments'

const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

const MatchSummaryHeader = ({ fixture }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }}>
    <Image source={{ uri: fixture?.home_team?.logo }} style={{ width: 28, height: 28 }} resizeMode='contain' />
    <Text className='font-supremeBold text-base'>
      {fixture?.home_team?.club_name}{' '}
      {fixture?.home_score != null ? `${fixture.home_score} - ${fixture.away_score}` : formatTime(fixture?.date_time_utc)}
      {' '}{fixture?.away_team?.club_name}
    </Text>
    <Image source={{ uri: fixture?.away_team?.logo }} style={{ width: 28, height: 28 }} resizeMode='contain' />
  </View>
)

// Content-only Comments (components/screens/Comments.jsx) needs modal chrome
// around it. Mirrors PlayerModal.jsx (web)/PlayerBottomSheet.jsx (native), but
// kept as a single file with a Platform branch - like ReactionSelector.jsx -
// since this modal has no other platform-specific content to justify a split.
const FixtureCommentsModal = ({ isVisible, onClose, fixture }) => {
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(() => ['90%'], [])

  useEffect(() => {
    if (Platform.OS === 'web') return
    if (isVisible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [isVisible])

  if (Platform.OS === 'web') {
    return (
      <RNModal visible={isVisible} onRequestClose={onClose} transparent>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.container}>
                <Comments post_id={fixture?.id} type='match' ListHeaderComponent={<MatchSummaryHeader fixture={fixture} />} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </RNModal>
    )
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDismissOnClose
      enableDynamicSizing={false}
      onDismiss={onClose}
      backgroundStyle={{ borderRadius: 20 }}
      stackBehavior='switch'
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={onClose} />
      )}
    >
      <View style={{ flex: 1, paddingVertical: 10 }}>
        <Comments post_id={fixture?.id} type='match' ListHeaderComponent={<MatchSummaryHeader fixture={fixture} />} />
      </View>
    </BottomSheetModal>
  )
}

export default FixtureCommentsModal

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === 'web' ? '50%' : '90%',
    height: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
