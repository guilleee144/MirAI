-- Steam link: remember the SteamID64 so the library can re-sync playtime in the background.
-- Safe to run more than once.
alter table public.profiles
  add column if not exists steam_id text;
