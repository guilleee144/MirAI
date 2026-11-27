-- AniList link: remember which public AniList user this profile is connected to.
-- Safe to run more than once.
alter table public.profiles
  add column if not exists anilist_username text;
