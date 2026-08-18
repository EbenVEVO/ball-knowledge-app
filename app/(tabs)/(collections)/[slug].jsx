import { View, Text, ScrollView, Pressable, ActivityIndicator, Image, Platform } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from '@expo/vector-icons/Feather'
import Ionicons from '@expo/vector-icons/Ionicons'
import ViewShot from 'react-native-view-shot'
import { supabase } from '@/lib/supabase'
import { toggleCollectionUpvote, fetchCollectionUpvoteStatus, fetchCollectionAuthor, buildCollectionShareUrl } from '@/lib/collections'
import { useAuth } from '../../../contexts/AuthContext'
import { useRequireAuth } from '../../../hooks/useRequireAuth'
import CollectionCreationModal, { CollectionItemCard } from '../../../components/ui/CollectionCreationModal'
import CollectionExportCard from '../../../components/ui/CollectionExportCard'
import ShareModal from '../../../components/ui/ShareModal'
import GlassIconButton, { GLASS_ROW_HEIGHT, GLASS_ROW_PADDING } from '../../../components/ui/GlassIconButton'

const PURPLE = "#A477C7";

function toCardItem(row) {
  if (row.player_stats) {
    const ps = row.player_stats;
    return {
      type: "playerMatch",
      localId: `item-${row.id}`,
      player_stats_id: ps.id,
      player: ps.player,
      stats: ps,
      fixture: ps.fixture,
      highlighted_stats: row.highlighted_stats ?? [],
    };
  }
  const q = row.saved_query;
  return {
    type: "savedQuery",
    localId: `item-${row.id}`,
    query_id: q?.id ?? null,
    question: row.question ?? q?.question,
    answer: row.answer ?? q?.answer,
    colors: row.colors ?? q?.colors,
    hero: row.hero ?? q?.hero,
  };
}

export default function CollectionPage() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const shareURL = buildCollectionShareUrl(slug);
  const { session, profile } = useAuth();
  const requireAuth = useRequireAuth();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [upvoting, setUpvoting] = useState(false);
  const [author, setAuthor] = useState(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const snapshotRef = useRef();

  const fetchCollection = useCallback(async () => {
    const { data, error } = await supabase
      .from('users_collections')
      .select(`
        id, title, slug, user_id, description, visibility, upvote_count,
        users_collections_items (
          id, highlighted_stats, position, question, answer, colors, hero,
          saved_query:query_id ( id, question, answer, colors, hero ),
          player_stats:player_stats_id (
            *,
            team:clubs!team_id ( club_name, logo, colors ),
            player:player_id ( * ),
            fixture:fixture_id (
              date_time_utc, home_score, away_score,
              home_team:home_team_id ( id, club_name, logo ),
              away_team:away_team_id ( id, club_name, logo ),
              league:league_id ( name, logo )
            )
          )
        )
      `)
      .eq('slug', slug)
      .order('position', { foreignTable: 'users_collections_items' })
      .single();
    if (!error) {
      setCollection(data);
      setUpvoteCount(data.upvote_count ?? 0);
    } else {
      console.log(error);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  useEffect(() => {
    if (!collection?.id || !session?.user?.id) {
      setUpvoted(false);
      return;
    }
    let cancelled = false;
    fetchCollectionUpvoteStatus(collection.id, session.user.id).then(({ data }) => {
      if (!cancelled) setUpvoted(!!data);
    });
    return () => {
      cancelled = true;
    };
  }, [collection?.id, session?.user?.id]);

  useEffect(() => {
    if (!collection?.user_id) {
      setAuthor(null);
      return;
    }
    if (session?.user?.id === collection.user_id && profile) {
      setAuthor(profile);
      return;
    }
    let cancelled = false;
    fetchCollectionAuthor(collection.user_id).then(({ data, error }) => {
      if (!cancelled && !error) setAuthor(data);
    });
    return () => {
      cancelled = true;
    };
  }, [collection?.user_id, session?.user?.id, profile]);

  const handleUpvote = async () => {
    if (!collection?.id || upvoting) return;
    setUpvoting(true);
    const { error } = await toggleCollectionUpvote(collection.id);
    if (error) {
      console.log(error);
    } else {
      const willBeUpvoted = !upvoted;
      setUpvoted(willBeUpvoted);
      setUpvoteCount((prev) => prev + (willBeUpvoted ? 1 : -1));
    }
    setUpvoting(false);
  };

  const capture = async () => {
    const uri = await snapshotRef.current.capture();
    return uri;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={PURPLE} />
      </View>
    );
  }

  const isOwner = !!session?.user?.id && session.user.id === collection?.user_id;
  const items = (collection?.users_collections_items ?? []).map(toCardItem);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {Platform.OS !== 'web' && (
        <View pointerEvents='box-none' style={{ position: 'absolute', left: 0, right: 0, top: insets.top, height: GLASS_ROW_HEIGHT, zIndex: 20, elevation: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GLASS_ROW_PADDING }}>
          <GlassIconButton onPress={() => router.back()}>
            <Ionicons name='chevron-back' size={20} color='white' />
          </GlassIconButton>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <GlassIconButton onPress={() => setShareModalVisible(true)}>
              <Feather name="share-2" size={18} color="white" />
            </GlassIconButton>
            {isOwner && (
              <GlassIconButton onPress={() => setEditModalVisible(true)}>
                <Feather name="edit-3" size={18} color="white" />
              </GlassIconButton>
            )}
          </View>
        </View>
      )}
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: Platform.OS !== 'web' ? insets.top + GLASS_ROW_HEIGHT + 20 : 20, paddingBottom: 40 }}>
                  <Text
            style={{ fontFamily: 'SupremeExtraBold', fontSize: 22, color: '#1a1430', flex: 1, marginRight: 12 }}
            numberOfLines={1}
          >
            {collection?.title}
          </Text>
                  {author?.username ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            {author.profile_pic && (
              <Image source={{ uri: author.profile_pic }} style={{ width: 22, height: 22, borderRadius: 11, marginRight: 6 }} />
            )}
            <Text style={{ fontFamily: 'Supreme', fontSize: 13, color: 'rgba(0,0,0,0.45)' }} numberOfLines={1}>
              Collected by @{author.username}
            </Text>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 }}>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {collection?.visibility === 'public' && (
              <Pressable
                onPress={() => requireAuth(handleUpvote)}
                disabled={upvoting}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: upvoted ? PURPLE : 'white',
                  borderWidth: 1,
                  borderColor: PURPLE,
                  borderRadius: 20,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  opacity: upvoting ? 0.6 : 1,
                }}
              >
                <Feather name="arrow-up" size={14} color={upvoted ? 'white' : PURPLE} />
                <Text style={{ fontFamily: 'SupremeExtraBold', color: upvoted ? 'white' : PURPLE, fontSize: 13 }}>
                  {upvoteCount}
                </Text>
              </Pressable>
            )}
            {Platform.OS === 'web' && (
              <>
                <Pressable
                  onPress={() => setShareModalVisible(true)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PURPLE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
                >
                  <Feather name="share-2" size={14} color="white" />
                  <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 13 }}>Share</Text>
                </Pressable>
                {isOwner && (
                  <Pressable
                    onPress={() => setEditModalVisible(true)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: PURPLE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}
                  >
                    <Feather name="edit-3" size={14} color="white" />
                    <Text style={{ fontFamily: 'SupremeExtraBold', color: 'white', fontSize: 13 }}>Edit</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        </View>



        {collection?.description ? (
          <Text style={{ fontFamily: 'Supreme', color: '#666', fontSize: 14, lineHeight: 20, marginBottom: 16 }}>
            {collection.description}
          </Text>
        ) : null}

        {items.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontFamily: 'Supreme', color: '#aaa', fontSize: 14 }}>
              No items in this collection yet
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <CollectionItemCard key={item.localId} item={item} isEditMode={false} />
          ))
        )}
      </ScrollView>

      <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <ViewShot ref={snapshotRef} options={{ format: 'png', quality: 1, width: 1050, height: 1350 }}>
          <CollectionExportCard collection={collection} author={author} items={items} />
        </ViewShot>
      </View>

      <ShareModal
        isVisible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        link={shareURL}
        capture={capture}
        title="Share this collection"
        fileName={`${collection?.slug ?? 'collection'}.png`}
      />

      {isOwner && (
        <CollectionCreationModal
          isVisible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          editCollection={{ id: collection.id, title: collection.title, description: collection.description, items }}
          onSaved={fetchCollection}
        />
      )}
    </View>
  );
}
