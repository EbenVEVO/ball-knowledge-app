import { View, Text, Pressable, Platform, ScrollView } from 'react-native'
import React, { useRef, useEffect, useCallback } from 'react'
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import AntDesign from '@expo/vector-icons/AntDesign'

// Pill trigger -> anchored popup (web) / bottom-sheet scroller (native). Shared by the
// formation and "Fill with Club" pickers, which are otherwise mechanically identical.
export default function PopupSelectMenu({
  visible,
  onRequestOpen,
  onRequestClose,
  triggerLabel,
  data = [],
  keyExtractor,
  renderOption,
  onSelect,
  renderHeader,
  emptyText = 'No results',
  popupWidth = 260,
  sheetSnapPoints = ['50%'],
}) {
  const bottomSheetRef = useRef(null)

  useEffect(() => {
    if (Platform.OS === 'web') return
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={onRequestClose} />
    ),
    [onRequestClose]
  )

  const handleSelect = (item) => {
    onSelect(item)
    onRequestClose()
  }

  const optionRows =
    data.length === 0 ? (
      <Text style={{ fontFamily: 'Supreme', color: '#aaa', fontSize: 13, padding: 16, textAlign: 'center' }}>
        {emptyText}
      </Text>
    ) : (
      data.map((item) => (
        <Pressable key={keyExtractor(item)} onPress={() => handleSelect(item)} style={{ paddingVertical: 10, paddingHorizontal: 14 }}>
          {renderOption(item)}
        </Pressable>
      ))
    )

  return (
    <View style={{ position: 'relative' }}>
      <Pressable
        onPress={() => (visible ? onRequestClose() : onRequestOpen())}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: 'white',
          borderWidth: 1.5,
          borderColor: '#e0d6f5',
          borderRadius: 24,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 14, color: '#1a1430' }} numberOfLines={1}>
          {triggerLabel}
        </Text>
        <AntDesign name={visible ? 'up' : 'down'} size={12} color="#1a1430" />
      </Pressable>

      {Platform.OS === 'web' && visible && (
        <>
          <Pressable
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
            onPress={onRequestClose}
          />
          <View
            style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: 8,
              left: 0,
              zIndex: 1000,
              backgroundColor: 'white',
              borderRadius: 14,
              width: popupWidth,
              maxHeight: 380,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.14,
              shadowRadius: 16,
              elevation: 12,
              borderWidth: 1,
              borderColor: '#ede8ff',
            }}
          >
            {renderHeader?.()}
            <ScrollView style={{ maxHeight: 320 }}>{optionRows}</ScrollView>
          </View>
        </>
      )}

      {Platform.OS !== 'web' && (
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={sheetSnapPoints}
          enablePanDownToClose
          enableDismissOnClose
          enableDynamicSizing={false}
          onDismiss={onRequestClose}
          backgroundStyle={{ borderRadius: 20 }}
          stackBehavior="push"
          backdropComponent={renderBackdrop}
        >
          {renderHeader?.()}
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            {optionRows}
          </BottomSheetScrollView>
        </BottomSheetModal>
      )}
    </View>
  )
}
