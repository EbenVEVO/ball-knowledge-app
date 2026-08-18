import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import Feather from '@expo/vector-icons/Feather'
import { getRatingColor } from '../../constants/statLabels'

const PURPLE = "#A477C7";

function getPreviewVisual(row) {
  if (row.player_stats) {
    return {
      photo: row.player_stats.player?.photo,
      color: row.player_stats.team?.colors?.[0] ?? PURPLE,
      rating: row.player_stats.rating ?? null,
    };
  }
  // Prefer the item's own denormalized snapshot (survives the linked saved
  // query being unsaved/deleted); fall back to the live join for older rows.
  const hero = row.hero ?? row.saved_query?.hero;
  const colors = row.colors ?? row.saved_query?.colors;
  return {
    photo: hero?.photo,
    color: colors?.[0] ?? PURPLE,
    rating: null,
  };
}

export default function CollectionPreviewCard({ collection, authorUsername, href }) {
  const items = collection.users_collections_items ?? [];
  const itemCount = items.length;
  const previewItems = items.slice(0, 4).map(getPreviewVisual);
  const overflow = itemCount - previewItems.length;

  return (
    <Link href={href ?? `/collections/${collection.slug}`} asChild>
      <Pressable
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 14,
          marginBottom: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            style={{ fontFamily: 'SupremeExtraBold', fontSize: 16, color: '#1a1430', flex: 1 }}
            numberOfLines={1}
          >
            {collection.title}
          </Text>
          <View style={{ backgroundColor: '#f0ecfc', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={{ fontFamily: 'SupremeExtraBold', color: PURPLE, fontSize: 12 }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>
        </View>

        {collection.description ? (
          <Text
            style={{ fontFamily: 'Supreme', fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 4 }}
            numberOfLines={2}
          >
            {collection.description}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          {authorUsername ? (
            <Text style={{ fontFamily: 'Supreme', fontSize: 12, color: 'rgba(0,0,0,0.4)' }} numberOfLines={1}>
              Collected by @{authorUsername}
            </Text>
          ) : <View />}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
            <Feather name="arrow-up" size={12} color="rgba(0,0,0,0.35)" />
            <Text style={{ fontFamily: 'Supreme', fontSize: 12, color: 'rgba(0,0,0,0.35)' }}>0</Text>
          </View>
        </View>

        {itemCount === 0 ? (
          <Text style={{ fontFamily: 'Supreme', fontSize: 13, color: '#aaa', marginTop: 10 }}>
            No items yet
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {previewItems.map((v, i) => (
              <View
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  marginLeft: i === 0 ? 0 : -12,
                  zIndex: previewItems.length - i,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: v.color,
                    borderWidth: 2,
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
                      bottom: -4,
                      right: -4,
                      backgroundColor: getRatingColor(v.rating),
                      borderRadius: 8,
                      paddingHorizontal: 4,
                      paddingVertical: 1,
                      borderWidth: 1.5,
                      borderColor: 'white',
                    }}
                  >
                    <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 8 }}>
                      {parseFloat(v.rating).toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {overflow > 0 && (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#f0ecfc',
                  borderWidth: 2,
                  borderColor: 'white',
                  marginLeft: -12,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: 'SupremeExtraBold', color: PURPLE, fontSize: 12 }}>
                  +{overflow}
                </Text>
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Link>
  );
}
