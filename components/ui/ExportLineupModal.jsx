import Entypo from '@expo/vector-icons/Entypo'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Image,
  Platform,
  Pressable,
  Modal as RNModal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import ViewShot from 'react-native-view-shot'
import VerticalField from '@/components/ui/VerticalField'
import AngledPitch from '@/components/ui/AngledPitch'
import { getSlotStyle, getAngledSlotStyle } from '@/constants/pitchPositions'

const PURPLE = '#A477C7'
const PITCH_ASPECT = 1000 / 600 // matches VerticalField's native aspect ratio

const PITCH_W = 800
const FLAT_PITCH_H = Math.round(PITCH_W * PITCH_ASPECT)
// The angled pitch is drawn much shorter than the flat one - a full-height trapezoid leaves
// huge empty gaps between rows (there's no second team/away-half content to fill it), and
// smaller markers (below) need less vertical room to stop names overlapping between rows.
const ANGLED_PITCH_H = 820
const HEADER_H = 100
const FOOTER_H = 70
const PADDING = 40

// Must match ExportSlot's actual rendered footprint below - passed to getSlotStyle /
// getAngledSlotStyle so the centering offset lines up with what's really on screen.
// (A mismatch here is what causes markers to visually drift off their pitch position.)
const FLAT_SLOT = { width: 150, avatar: 105, font: 20, border: 3 }
FLAT_SLOT.height = FLAT_SLOT.avatar + 60 // avatar + margin + up to 2 lines of name

// Angled markers are smaller than the flat pitch's - the trapezoid is narrower at the top,
// so full-size markers collide with their neighbors on the top rows.
const ANGLED_SLOT = { width: 128, avatar: 85, font: 18, border: 2 }
ANGLED_SLOT.height = ANGLED_SLOT.avatar + 64

const getPitchHeight = (angled) => (angled ? ANGLED_PITCH_H : FLAT_PITCH_H)
const getSlotConfig = (angled) => (angled ? ANGLED_SLOT : FLAT_SLOT)

// GK sits at y=95% - only 5% of the pitch's height from the bottom edge, the tightest margin
// of any role - so a tall marker (photo + 2-line name) centered there can extend past the
// pitch's own bottom edge and get clipped out of the captured PNG. Rather than relying on
// extra canvas padding (unreliable through html2canvas - overflowing content past a captured
// element's own box gets cut regardless of CSS overflow), getSlotStyle/getAngledSlotStyle's
// `edgeInsetPct` clamps every role's *position* to stay at least this percentage from either
// edge, so the full marker footprint - whatever size it's tuned to above - physically fits
// inside the pitch box. Sized exactly to the marker's own half-height (plus a small fixed pad)
// rather than a generic margin, since on the short angled pitch an oversized margin here ends
// up clamping (and cramming together) every row, not just GK's.
const getEdgeInsetPct = (angled) => {
  const pitchHeight = getPitchHeight(angled)
  const slotConfig = getSlotConfig(angled)
  return (slotConfig.height / 2 / pitchHeight) * 100 + 2
}

const getExportSize = (fieldOnly, angled) => {
  const pitchHeight = getPitchHeight(angled)
  if (fieldOnly) return { width: PITCH_W, height: pitchHeight }
  return { width: PITCH_W + PADDING * 2, height: HEADER_H + pitchHeight + FOOTER_H + PADDING * 2 }
}

const THEMES = {
  dark: { bgColor: '#2b2b2e', lineColor: '#8a8a8f', card: '#111113', primary: '#ffffff', secondary: 'rgba(255,255,255,0.5)' },
  regular: { bgColor: undefined, lineColor: undefined, card: '#ffffff', primary: '#1a1430', secondary: 'rgba(26,20,48,0.5)' },
}

const THEME_OPTIONS = [
  { key: 'regular', label: 'Regular', icon: (active) => <Entypo name="light-up" size={20} color={active ? 'white' : '#0d0d0d'} /> },
  { key: 'dark', label: 'Dark', icon: (active) => <MaterialIcons name="dark-mode" size={20} color={active ? 'white' : '#0d0d0d'} /> },
]

function ExportSlot({ player, style, isDark, config }) {
  if (!player) return null
  const nameColor = player.highlighted ? PURPLE : isDark ? '#ffffff' : '#000000'
  // Deliberately not using numberOfLines here - react-native-web implements it via the legacy
  // `display: -webkit-box` + `-webkit-line-clamp` + `overflow: clip` technique, which (at least
  // in Safari) doesn't reliably respect an explicit `lineHeight` override and ends up clipping
  // the ascenders off every name. A fixed-height wrapper with plain `overflow: hidden` clamps to
  // 2 lines the same way, without that legacy rendering path.
  const lineHeight = Math.round(config.font * 1.45)
  return (
    <View style={[{ width: config.width, alignItems: 'center' }, style]}>
      <Image
        source={{ uri: player.photo }}
        style={{
          width: config.avatar,
          height: config.avatar,
          borderRadius: config.avatar / 2,
          borderWidth: config.border,
          borderColor: 'white',
        }}
      />
      <View style={{ width: '100%', height: lineHeight * 2.4, marginTop: 2, overflow: 'hidden' }}>
        <Text
          style={{
            fontFamily: 'SupremeBold',
            fontSize: config.font,
            lineHeight,
            color: nameColor,
            textAlign: 'center',
            ...(isDark
              ? {}
              : {
                  textShadowColor: 'rgba(255,255,255,0.75)',
                  textShadowOffset: { width: -1, height: 1 },
                  textShadowRadius: 10,
                }),
          }}
        >
          {player.name}
        </Text>
      </View>
    </View>
  )
}

function LineupCard({ theme, slotKeys, slots, formationLabel, fieldOnly, angled }) {
  const isDark = theme === 'dark'
  const t = THEMES[theme]
  const Pitch = angled ? AngledPitch : VerticalField
  const pitchHeight = getPitchHeight(angled)
  const slotConfig = getSlotConfig(angled)
  const edgeInsetPct = getEdgeInsetPct(angled)
  const slotStyleFor = (role) =>
    angled
      ? getAngledSlotStyle(role, PITCH_W, pitchHeight, { boxWidth: slotConfig.width, boxHeight: slotConfig.height, edgeInsetPct })
      : getSlotStyle(role, { boxWidth: slotConfig.width, boxHeight: slotConfig.height, edgeInsetPct })

  const pitch = (
    <Pitch width={PITCH_W} height={pitchHeight} bgColor={t.bgColor} lineColor={t.lineColor}>
      {slotKeys.map((role, index) => (
        <ExportSlot key={`${role}-${index}`} player={slots[index]} style={slotStyleFor(role)} isDark={isDark} config={slotConfig} />
      ))}
      <View style={{ position: 'absolute', bottom: 0, right: 0, padding: 10 }}>
        <Image
          source={require('../../assets/images/logo-dark-watermark.png')}
          style={{ height: 60, width: 232 }}
          resizeMode="contain"
        />
      </View>
    </Pitch>
  )

  if (fieldOnly) return pitch

  const { width: exportWidth, height: exportHeight } = getExportSize(false, angled)

  return (
    <View style={{ width: exportWidth, height: exportHeight, backgroundColor: t.card, alignItems: 'center', paddingVertical: PADDING }}>
      <View style={{ height: HEADER_H, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'SupremeExtraBold', fontSize: 30, color: t.primary }}>
          {formationLabel || 'Lineup'}
        </Text>
      </View>

      {pitch}

      <View style={{ height: FOOTER_H, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'Supreme', fontSize: 18, color: t.secondary }}>ballknow.app</Text>
      </View>
    </View>
  )
}

// Pixel-exact scaled-down preview of the true exportWidth x exportHeight card, same approach
// as ExportGraphicModal's ScaledPreview - keeps the on-screen preview matching the captured image.
function ScaledPreview({ children, previewWidth, exportWidth, exportHeight }) {
  const [width, setWidth] = useState(0)
  const scale = width > 0 ? width / exportWidth : 0
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{
        width: previewWidth,
        aspectRatio: exportWidth / exportHeight,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.08)',
      }}
    >
      {width > 0 && (
        <View style={{ width: exportWidth, height: exportHeight, transform: [{ scale }], transformOrigin: '0 0' }}>
          {children}
        </View>
      )}
    </View>
  )
}

export default function ExportLineupModal({ visible, onClose, slotKeys, slots, formationLabel }) {
  const [theme, setTheme] = useState('regular')
  const [fieldOnly, setFieldOnly] = useState(false)
  const [angled, setAngled] = useState(false)
  const shotRef = useRef()
  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(() => ['85%'], [])

  const { width: exportWidth, height: exportHeight } = getExportSize(fieldOnly, angled)

  useEffect(() => {
    if (Platform.OS === 'web') return
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  const saveImage = async () => {
    const uri = await shotRef.current.capture({ pixelRatio: 2 })
    if (Platform.OS === 'web') {
      const link = document.createElement('a')
      link.href = uri
      const suffix = [fieldOnly && 'field', angled && 'angled'].filter(Boolean).join('_')
      link.download = `${(formationLabel || 'lineup').replace(/\s+/g, '_')}_lineup${suffix ? `_${suffix}` : ''}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Save Lineup Image' })
    }
  }

  const sharedContent = (ScrollViewComponent) => (
    <>
      <ScrollViewComponent
        style={{ flex: 1, marginBottom: 12 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <Text style={{ fontFamily: 'SupremeBold', fontSize: 15, marginBottom: 12 }}>Export Lineup</Text>

        <View style={{ gap: 6, marginBottom: 16, alignItems: 'center' }}>
          <ScaledPreview
            previewWidth={Platform.OS === 'web' ? '55%' : '90%'}
            exportWidth={exportWidth}
            exportHeight={exportHeight}
          >
            <LineupCard
              theme={theme}
              slotKeys={slotKeys}
              slots={slots}
              formationLabel={formationLabel}
              fieldOnly={fieldOnly}
              angled={angled}
            />
          </ScaledPreview>
        </View>

        <View style={{ gap: 20 }}>
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionLabel}>Theme</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {THEME_OPTIONS.map(({ key, label, icon }) => {
                const active = theme === key
                return (
                  <Pressable
                    key={key}
                    onPress={() => setTheme(key)}
                    style={[styles.themeBtn, active && styles.themeBtnActive]}
                  >
                    {icon(active)}
                    <Text style={[styles.themeBtnLabel, active && styles.themeBtnLabelActive]}>{label}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Field Only</Text>
              <Text style={styles.rowHint}>Drop the title and watermark text</Text>
            </View>
            <Switch
              value={fieldOnly}
              onValueChange={setFieldOnly}
              trackColor={{ false: '#e0d6f5', true: PURPLE }}
              thumbColor="white"
              accessibilityLabel="Field Only toggle"
            />
          </View>

          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Angled View</Text>
              <Text style={styles.rowHint}>3D-style perspective pitch</Text>
            </View>
            <Switch
              value={angled}
              onValueChange={setAngled}
              trackColor={{ false: '#e0d6f5', true: PURPLE }}
              thumbColor="white"
              accessibilityLabel="Angled View toggle"
            />
          </View>
        </View>
      </ScrollViewComponent>

      <View style={[styles.actionRow, { paddingHorizontal: 16, paddingBottom: 16 }]}>
        <TouchableOpacity onPress={saveImage} style={styles.actionBtn} activeOpacity={0.75}>
          <MaterialIcons name="save-alt" size={18} color="white" />
          <Text style={styles.actionBtnLabel}>Save Image</Text>
        </TouchableOpacity>
      </View>
    </>
  )

  return (
    <View>
      <View style={styles.offscreen}>
        <ViewShot ref={shotRef} options={{ format: 'png', quality: 1 }}>
          <LineupCard
            theme={theme}
            slotKeys={slotKeys}
            slots={slots}
            formationLabel={formationLabel}
            fieldOnly={fieldOnly}
            angled={angled}
          />
        </ViewShot>
      </View>

      {Platform.OS === 'web' ? (
        <RNModal visible={visible} onRequestClose={onClose} transparent>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.container}>{sharedContent(ScrollView)}</View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </RNModal>
      ) : (
        <BottomSheetModal
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose
          enableDismissOnClose
          enableDynamicSizing={false}
          onDismiss={onClose}
          backgroundStyle={{ borderRadius: 20 }}
          stackBehavior="switch"
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={onClose} />
          )}
        >
          {sharedContent(BottomSheetScrollView)}
        </BottomSheetModal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    top: -99999,
    left: 0,
  },
  container: {
    width: '50%',
    height: '85%',
    backgroundColor: 'white',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionLabel: {
    fontFamily: 'SupremeBold',
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: 'SupremeBold',
    fontSize: 13,
    color: '#0d0d0d',
  },
  rowHint: {
    fontFamily: 'Supreme',
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 2,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: 'transparent',
  },
  themeBtnActive: {
    backgroundColor: PURPLE,
    borderColor: '#ffffff',
  },
  themeBtnLabel: {
    fontFamily: 'Supreme',
    fontSize: 12,
    color: '#0d0d0d',
  },
  themeBtnLabelActive: {
    color: 'white',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: PURPLE,
  },
  actionBtnLabel: {
    fontFamily: 'SupremeBold',
    fontSize: 13,
    color: 'white',
  },
})
