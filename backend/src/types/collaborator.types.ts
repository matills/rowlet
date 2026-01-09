export type CollaboratorRole = 'admin' | 'editor' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface ListCollaborator {
  id: string;
  list_id: string;
  user_id: string;
  role: CollaboratorRole;
  added_by: string;
  created_at: string;
}

export interface CollaboratorWithUser extends ListCollaborator {
  user: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface ListInvitation {
  id: string;
  list_id: string;
  inviter_id: string;
  invitee_id: string;
  role: CollaboratorRole;
  status: InvitationStatus;
  created_at: string;
  expires_at: string;
}

export interface InvitationWithDetails extends ListInvitation {
  inviter: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  list: {
    id: string;
    name: string;
    description: string | null;
    cover_image_url: string | null;
  };
}

export interface InviteeDetails {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}
