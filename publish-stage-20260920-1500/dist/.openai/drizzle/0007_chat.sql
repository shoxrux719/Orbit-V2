ALTER TABLE campus_messages ADD COLUMN kind TEXT NOT NULL DEFAULT 'text' CHECK(kind IN ('text','sticker'));
ALTER TABLE campus_messages ADD COLUMN sticker_id TEXT;
ALTER TABLE campus_messages ADD COLUMN reply_to TEXT REFERENCES campus_messages(id) ON DELETE SET NULL;
ALTER TABLE campus_messages ADD COLUMN client_id TEXT;
CREATE UNIQUE INDEX campus_messages_client ON campus_messages(sender_id,client_id) WHERE client_id IS NOT NULL;
CREATE INDEX campus_messages_sender ON campus_messages(sender_id,created_at);
CREATE TABLE campus_message_reactions(
 message_id TEXT NOT NULL REFERENCES campus_messages(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES school_users(id) ON DELETE CASCADE,
 emoji TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 PRIMARY KEY(message_id,user_id,emoji)
);
