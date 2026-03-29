// В CollectionClient, в возврате обычной коллекции:
<PhotoGrid
  photos={activeAlbumData.photos as Photo[]}
  onDelete={async (id) => {
    await supabase.from('photos').delete().eq('id', id)
    setAlbums(prev => prev.map(a => ({
      ...a,
      photos: (a.photos ?? []).filter((p: Photo) => p.id !== id)
    })))
  }}
  onMove={async (photo, collectionId, albumId) => {
    await supabase
      .from('photos')
      .update({ collection_id: collectionId, album_id: albumId })
      .eq('id', photo.id)
    // Удаляем из текущего альбома
    setAlbums(prev => prev.map(a => ({
      ...a,
      photos: (a.photos ?? []).filter((p: Photo) => p.id !== photo.id)
    })))
  }}
  onRename={async (id, newName) => {
    await supabase.from('photos').update({ name: newName }).eq('id', id)
    setAlbums(prev => prev.map(a => ({
      ...a,
      photos: (a.photos ?? []).map(p => p.id === id ? { ...p, name: newName } : p)
    })))
  }}
  onPrivacyChange={async (id, privacy) => {
    await supabase.from('photos').update({ privacy }).eq('id', id)
    setAlbums(prev => prev.map(a => ({
      ...a,
      photos: (a.photos ?? []).map(p => p.id === id ? { ...p, privacy } : p)
    })))
  }}
  collections={allCollections}  // ← ВАЖНО! Передаем все коллекции
  albumsMap={albumsMap}          // ← Передаем маппинг альбомов
  isOwn={true}
  onRefresh={async () => {
    // Перезагружаем данные
    const { data: freshAlbums } = await supabase
      .from('albums')
      .select('*, photos:*')
      .eq('collection_id', collection.id)
    if (freshAlbums) setAlbums(freshAlbums)
  }}
/>
