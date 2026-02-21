-- beans table
CREATE TABLE beans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT,
  origin        TEXT,
  roaster       TEXT,
  roast_level   TEXT CHECK (roast_level IN ('Light', 'Medium', 'Dark')),
  brew_method   TEXT,
  tasting_notes TEXT NOT NULL DEFAULT '',
  rating        INTEGER NOT NULL DEFAULT 1 CHECK (rating BETWEEN 1 AND 5),
  price         NUMERIC(10, 2),
  photo_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK index (Postgres does NOT auto-create this)
CREATE INDEX ON beans (user_id);
CREATE INDEX ON beans (created_at);

-- Auto-update updated_at on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER beans_updated_at
  BEFORE UPDATE ON beans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Row-Level Security: users can only access their own beans
ALTER TABLE beans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_beans" ON beans
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
