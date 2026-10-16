-- Chat: make sure users can only ever see and write their own messages,
-- and keep the history query (latest N per user) fast.
-- Safe to run more than once.

alter table public.chat_messages enable row level security;

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
  on public.chat_messages for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Needed later for a "clear conversation" action.
drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own"
  on public.chat_messages for delete
  to authenticated
  using (auth.uid() = user_id);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at desc);
