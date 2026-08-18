import { View, Text, Image } from 'react-native'
import React from 'react'
import { getRatingColor } from '../../constants/statLabels'

const PURPLE = "#A477C7";

function getExportVisual(item) {
  if (item.type === 'playerMatch') {
    return {
      photo: item.player?.photo,
      color: item.stats?.team?.colors?.[0] ?? PURPLE,
      rating: item.stats?.rating ?? null,
    };
  }
  return {
    photo: item.hero?.photo,
    color: item.colors?.[0] ?? PURPLE,
    rating: null,
  };
}

// Offscreen 1050x1350 card captured via ViewShot for the collection's share/export image
export default function CollectionExportCard({ collection, author, items = [] }) {
  const itemCount = items.length;
  const previewItems = items.slice(0, 5).map(getExportVisual);
  const overflow = itemCount - previewItems.length;

  return (
    <View style={{ width: 1050, height: 1350, backgroundColor: PURPLE, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: 28, paddingHorizontal: 90 }}>
        <Text
          style={{ fontFamily: 'SupremeExtraBold', fontSize: 68, color: 'white', textAlign: 'center' }}
          numberOfLines={2}
        >
          {collection?.title}
        </Text>

        {collection?.description ? (
          <Text
            style={{ fontFamily: 'Supreme', fontSize: 32, color: 'rgba(255,255,255,0.85)', textAlign: 'center' }}
            numberOfLines={3}
          >
            {collection.description}
          </Text>
        ) : null}

        {itemCount > 0 && (
          <View style={{ alignItems: 'center', gap: 14 }}>
            <View style={{ flexDirection: 'row' }}>
              {previewItems.map((v, i) => (
                <View
                  key={i}
                  style={{
                    width: 150,
                    height: 150,
                    marginLeft: i === 0 ? 0 : -50,
                    zIndex: previewItems.length - i,
                  }}
                >
                  <View
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 75,
                      backgroundColor: v.color,
                      borderWidth: 5,
                      borderColor: 'white',
                      overflow: 'hidden',
                    }}
                  >
                    {v.photo && (
                      <Image source={{ uri: v.photo }} style={{ width: '100%', height: '100%' }} />
                    )}
                  </View>
                  {v.rating != null && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: -8,
                        right: -8,
                        backgroundColor: getRatingColor(v.rating),
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 4,
                        borderWidth: 4,
                        borderColor: 'white',
                      }}
                    >
                      <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 22 }}>
                        {parseFloat(v.rating).toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {overflow > 0 && (
                <View
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 75,
                    backgroundColor: 'white',
                    borderWidth: 5,
                    borderColor: PURPLE,
                    marginLeft: -50,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'SupremeExtraBold', color: PURPLE, fontSize: 40 }}>
                    +{overflow}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontFamily: 'Supreme', fontSize: 26, color: 'rgba(255,255,255,0.75)' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.3)',
          padding: 40,
          position: 'absolute',
          bottom: 0,
        }}
      >
        <Text style={{ fontFamily: 'Supreme', fontSize: 36, color: 'white' }}>Ball Knowledge</Text>
        <Text style={{ fontFamily: 'Supreme', fontSize: 36, color: 'white' }}>@{author?.username}</Text>
      </View>
    </View>
  );
}
