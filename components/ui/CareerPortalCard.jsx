import { View, Text, Pressable } from 'react-native'
import React from 'react'
import ClubChoiceCard from './ClubChoiceCard'

const PURPLE = '#A477C7'

// The "Career Portal" panel below the ladder — either a narrative beat (SCENARIO / TROPHY WON,
// single Continue) or a choice beat (academy/transfer window, pick a club then Continue).
export default function CareerPortalCard({
  mode, // 'narrative' | 'choice'
  title,
  description,
  options = [],
  selectedClubId,
  onSelectClub,
  onContinue,
  continueDisabled = false,
}) {
  const isNarrative = mode === 'narrative'

  return (
    <View>
      <Text className='font-supremeBold' style={{ fontSize: 20, marginBottom: 10, marginTop: 20 }}>
        CAREER PORTAL
      </Text>

      <View style={{ backgroundColor: '#F5F5F5', borderRadius: 12, borderWidth: 1, borderColor: '#E5E5E5', padding: 18 }}>
        <Text
          className='font-supremeBold'
          style={{ fontSize: isNarrative ? 24 : 16, textAlign: isNarrative ? 'center' : 'left', marginBottom: 10 }}
        >
          {title}
        </Text>

        {description ? (
          <Text
            className='font-supreme'
            style={{ fontSize: 14, color: '#333', textAlign: isNarrative ? 'center' : 'left', lineHeight: 20, marginBottom: isNarrative ? 24 : 16 }}
          >
            {description}
          </Text>
        ) : null}

        {!isNarrative && options.length > 0 && (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            {options.map((option) => (
              <ClubChoiceCard
                key={option.club_id}
                option={option}
                selected={selectedClubId === option.club_id}
                onPress={() => onSelectClub(option.club_id)}
              />
            ))}
          </View>
        )}

        <Pressable
          onPress={onContinue}
          disabled={continueDisabled}
          style={{
            backgroundColor: PURPLE,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: continueDisabled ? 0.5 : 1,
          }}
        >
          <Text className='font-supremeBold' style={{ color: 'white', fontSize: 16 }}>Continue</Text>
        </Pressable>
      </View>
    </View>
  )
}
