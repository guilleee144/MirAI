// src/features/discover/components/GameCard.tsx
import { memo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { GameImage } from '@/components/ui/GameImage'
import type { GameListCategory, StoreGame } from '@/services/steamStore'

const ROW_CARD_WIDTH = 210

function GameCardBase({ game, width = ROW_CARD_WIDTH }: { game: StoreGame; width?: number }) {
  const navigation = useNavigation()
  const onSale = game.discountPercent > 0
  const imageHeight = Math.round((width * 215) / 460) // Steam header images are 460x215

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.navigate('GameDetail' as never, { id: String(game.id) } as never)}>
      <View style={{ width, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
        <GameImage sources={game.imageSources} style={{ width, height: imageHeight }} />
        <View style={{ padding: 10, backgroundColor: '#141826' }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }} numberOfLines={1}>
            {game.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, minHeight: 18 }}>
            {onSale && (
              <View style={{ backgroundColor: 'rgba(46,229,157,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: '#2EE59D', fontSize: 10, fontWeight: '700' }}>-{game.discountPercent}%</Text>
              </View>
            )}
            {game.price && <Text style={{ color: '#B8C1D1', fontSize: 11, fontWeight: '600' }}>{game.price}</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export const GameCard = memo(GameCardBase)

/** Horizontal row of game cards with a title, "See all", loading and error states. */
export function GameRow({
  title,
  category,
  data,
  isLoading,
  isError,
}: {
  title: string
  category: GameListCategory
  data: StoreGame[] | undefined
  isLoading: boolean
  isError?: boolean
}) {
  const navigation = useNavigation()

  return (
    <View style={{ marginTop: 28 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GameList' as never, { category } as never)}>
          <Text style={{ color: '#6C5CE7', fontSize: 13 }}>See all</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6C5CE7" />
        </View>
      ) : isError || !data || data.length === 0 ? (
        <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#7B8496', fontSize: 13 }}>{isError ? "Couldn't load games right now" : 'Nothing here yet'}</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {data.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}
