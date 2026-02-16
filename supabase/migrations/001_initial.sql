CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS bookmark (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bookmark ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON bookmark FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own bookmarks" ON bookmark FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own bookmarks" ON bookmark FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own bookmarks" ON bookmark FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

CREATE INDEX idx_bookmark_user_id ON bookmark (user_id);

CREATE TRIGGER trg_bookmark_updated_at BEFORE UPDATE ON bookmark FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS tag (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tag ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags" ON tag FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own tags" ON tag FOR INSERT TO authenticated WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own tags" ON tag FOR UPDATE TO authenticated USING (user_id = (select auth.uid())) WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own tags" ON tag FOR DELETE TO authenticated USING (user_id = (select auth.uid()));

CREATE INDEX idx_tag_user_id ON tag (user_id);

CREATE TRIGGER trg_tag_updated_at BEFORE UPDATE ON tag FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE IF NOT EXISTS bookmark_tag (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY UNIQUE,
  bookmark_id UUID NOT NULL REFERENCES bookmark(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tag(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bookmark_tag ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmark tags" ON bookmark_tag FOR SELECT TO authenticated USING (exists (select 1 from bookmark b where b.id = bookmark_id and b.user_id = (select auth.uid())));

CREATE POLICY "Users can create own bookmark tags" ON bookmark_tag FOR INSERT TO authenticated WITH CHECK (exists (select 1 from bookmark b where b.id = bookmark_id and b.user_id = (select auth.uid())));

CREATE POLICY "Users can delete own bookmark tags" ON bookmark_tag FOR DELETE TO authenticated USING (exists (select 1 from bookmark b where b.id = bookmark_id and b.user_id = (select auth.uid())));

CREATE POLICY "Users can update own bookmark tags" ON bookmark_tag FOR UPDATE TO authenticated USING (exists (select 1 from bookmark b where b.id = bookmark_id and b.user_id = (select auth.uid()))) WITH CHECK (exists (select 1 from bookmark b where b.id = bookmark_id and b.user_id = (select auth.uid())));

CREATE INDEX idx_bookmark_tag_bookmark_id ON bookmark_tag (bookmark_id);

CREATE INDEX idx_bookmark_tag_tag_id ON bookmark_tag (tag_id);

CREATE TRIGGER trg_bookmark_tag_updated_at BEFORE UPDATE ON bookmark_tag FOR EACH ROW EXECUTE FUNCTION update_updated_at();