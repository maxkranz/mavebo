-- Mavebo Schema Migration
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || SUBSTRING(NEW.id::TEXT, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Follow relationships
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_select_all" ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Collections
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  privacy TEXT NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'followers', 'public')),
  cover_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections_select_own" ON public.collections FOR SELECT USING (
  auth.uid() = user_id
  OR privacy = 'public'
  OR (privacy = 'followers' AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = user_id
  ))
);
CREATE POLICY "collections_insert_own" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "collections_delete_own" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Albums
CREATE TABLE IF NOT EXISTS public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  privacy TEXT NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'followers', 'public')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "albums_select" ON public.albums FOR SELECT USING (
  auth.uid() = user_id
  OR privacy = 'public'
  OR (privacy = 'followers' AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = user_id
  ))
);
CREATE POLICY "albums_insert_own" ON public.albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "albums_update_own" ON public.albums FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "albums_delete_own" ON public.albums FOR DELETE USING (auth.uid() = user_id);

-- Photos
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  privacy TEXT NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'followers', 'public')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_select" ON public.photos FOR SELECT USING (
  auth.uid() = user_id
  OR privacy = 'public'
  OR (privacy = 'followers' AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = user_id
  ))
);
CREATE POLICY "photos_insert_own" ON public.photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photos_update_own" ON public.photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "photos_delete_own" ON public.photos FOR DELETE USING (auth.uid() = user_id);

-- Likes
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, photo_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select_all" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Shared collections (invites)
CREATE TABLE IF NOT EXISTS public.shared_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  collaborator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  can_add_photos BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(collection_id, collaborator_id)
);

ALTER TABLE public.shared_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shared_collections_select" ON public.shared_collections FOR SELECT USING (
  auth.uid() = owner_id OR auth.uid() = collaborator_id
);
CREATE POLICY "shared_collections_insert_own" ON public.shared_collections FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "shared_collections_delete_own" ON public.shared_collections FOR DELETE USING (auth.uid() = owner_id);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'share')),
  photo_id UUID REFERENCES public.photos(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_all" ON public.notifications FOR INSERT WITH CHECK (true);

-- Storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "photos_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "photos_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'photos' AND auth.uid() IS NOT NULL
);
CREATE POLICY "photos_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'photos' AND auth.uid()::TEXT = (storage.foldername(name))[1]
);
