CREATE TYPE list_collaborator_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');

ALTER TABLE custom_lists ADD COLUMN share_code TEXT UNIQUE;
CREATE INDEX idx_custom_lists_share_code ON custom_lists(share_code) WHERE share_code IS NOT NULL;

CREATE TABLE list_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role list_collaborator_role NOT NULL DEFAULT 'viewer',
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(list_id, user_id)
);

CREATE INDEX idx_list_collaborators_list ON list_collaborators(list_id);
CREATE INDEX idx_list_collaborators_user ON list_collaborators(user_id);

CREATE TABLE list_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role list_collaborator_role NOT NULL DEFAULT 'viewer',
  status invitation_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  CONSTRAINT no_self_invite CHECK (inviter_id != invitee_id)
);

CREATE INDEX idx_list_invitations_invitee ON list_invitations(invitee_id, status);
CREATE INDEX idx_list_invitations_list ON list_invitations(list_id);
CREATE UNIQUE INDEX idx_list_invitations_unique_pending
  ON list_invitations(list_id, invitee_id)
  WHERE status = 'pending';

ALTER TABLE list_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators of accessible lists"
  ON list_collaborators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists
      WHERE custom_lists.id = list_collaborators.list_id
      AND (custom_lists.user_id = auth.uid() OR custom_lists.is_public = true)
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "List owners can manage collaborators"
  ON list_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM custom_lists
      WHERE custom_lists.id = list_collaborators.list_id
      AND custom_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage collaborators"
  ON list_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM list_collaborators lc
      WHERE lc.list_id = list_collaborators.list_id
      AND lc.user_id = auth.uid()
      AND lc.role = 'admin'
    )
  );

CREATE POLICY "Users can view their invitations"
  ON list_invitations FOR SELECT
  USING (invitee_id = auth.uid() OR inviter_id = auth.uid());

CREATE POLICY "Users can create invitations for their lists"
  ON list_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_lists
      WHERE custom_lists.id = list_invitations.list_id
      AND custom_lists.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM list_collaborators
      WHERE list_collaborators.list_id = list_invitations.list_id
      AND list_collaborators.user_id = auth.uid()
      AND list_collaborators.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can update their own invitations"
  ON list_invitations FOR UPDATE
  USING (invitee_id = auth.uid());

CREATE POLICY "Inviters can delete their invitations"
  ON list_invitations FOR DELETE
  USING (inviter_id = auth.uid());

CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE list_collaborators IS 'Collaborators with access to custom lists';
COMMENT ON TABLE list_invitations IS 'Pending invitations to collaborate on lists';
