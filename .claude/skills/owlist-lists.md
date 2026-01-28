---
name: owlist-lists
description: >
  Owlist collaborative lists feature. Covers list CRUD, collaboration system,
  permissions, synchronization, and real-time updates.
  Trigger: When working on lists feature, collaboration, or sharing functionality.
license: MIT
metadata:
  author: owlist
  version: "1.0"
  scope: [root, frontend, backend, supabase]
  auto_invoke:
    - "Working on collaborative lists"
    - "List permissions and roles"
    - "List sharing functionality"
    - "List synchronization"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Feature Overview

Lists are a key differentiator for Owlist. Users can create personal lists and invite collaborators to edit them together.

### List Types

| Type | Description | Editable |
|------|-------------|----------|
| **Predefined** | Visto, Viendo, Quiero ver | Auto-populated, not editable |
| **Personal** | User-created lists | Owner only |
| **Collaborative** | Shared with others | Owner + Editors |

### Collaboration Roles

| Role | Permissions |
|------|-------------|
| **Owner** | Full control, delete list, manage collaborators |
| **Editor** | Add/remove items, reorder, add notes |
| **Viewer** | Read-only access |

## Database Schema

```sql
-- Lists
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_collaborative BOOLEAN DEFAULT false,
  item_count INTEGER DEFAULT 0,        -- Denormalized for performance
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- List items with ordering
CREATE TABLE public.list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  added_by UUID NOT NULL REFERENCES public.profiles(id),
  position INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, content_id)
);

-- Collaborators
CREATE TABLE public.list_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer')),
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- List activity log (for history)
CREATE TABLE public.list_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,                -- 'item_added' | 'item_removed' | 'reordered'
  content_id UUID REFERENCES public.content(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_lists_owner ON public.lists(owner_id);
CREATE INDEX idx_list_items_list ON public.list_items(list_id);
CREATE INDEX idx_list_items_position ON public.list_items(list_id, position);
CREATE INDEX idx_list_collaborators_user ON public.list_collaborators(user_id);
CREATE INDEX idx_list_activity_list ON public.list_activity(list_id);
```

## RLS Policies

```sql
-- Lists: Owner, collaborators, or public
CREATE POLICY "List visibility" ON public.lists FOR SELECT USING (
  is_public = true
  OR owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.list_collaborators
    WHERE list_id = id AND user_id = auth.uid()
  )
);

-- Lists: Only owner can update/delete
CREATE POLICY "Owner manages list" ON public.lists FOR ALL USING (
  owner_id = auth.uid()
);

-- List items: Same visibility as list
CREATE POLICY "List items visibility" ON public.list_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lists
    WHERE id = list_id AND (
      is_public = true
      OR owner_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.list_collaborators
        WHERE list_id = lists.id AND user_id = auth.uid()
      )
    )
  )
);

-- List items: Owner or editor can modify
CREATE POLICY "Editors modify items" ON public.list_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.lists WHERE id = list_id AND owner_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.list_collaborators
    WHERE list_id = list_items.list_id AND user_id = auth.uid() AND role = 'editor'
  )
);
```

## Backend Service

```typescript
// services/list.service.ts
import { supabase } from '@/lib/supabase';

export const listService = {
  // Create a new list
  async createList(userId: string, data: CreateListData) {
    const { data: list, error } = await supabase
      .from('lists')
      .insert({
        owner_id: userId,
        name: data.name,
        description: data.description,
        is_public: data.isPublic ?? false,
        is_collaborative: data.isCollaborative ?? false,
      })
      .select()
      .single();

    if (error) throw error;
    return list;
  },

  // Get list with items and collaborators
  async getList(listId: string, userId?: string) {
    const { data: list, error } = await supabase
      .from('lists')
      .select(`
        *,
        owner:profiles!owner_id(id, username, avatar_url),
        items:list_items(
          *,
          content(*),
          added_by:profiles!added_by(username, avatar_url)
        ),
        collaborators:list_collaborators(
          *,
          user:profiles!user_id(id, username, avatar_url)
        )
      `)
      .eq('id', listId)
      .order('position', { referencedTable: 'list_items' })
      .single();

    if (error) throw error;

    // Add user's role to response
    if (userId) {
      list.userRole = this.getUserRole(list, userId);
    }

    return list;
  },

  // Add item to list
  async addItem(listId: string, userId: string, contentId: string, notes?: string) {
    // Get max position
    const { data: maxPos } = await supabase
      .from('list_items')
      .select('position')
      .eq('list_id', listId)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = (maxPos?.position ?? -1) + 1;

    const { data: item, error } = await supabase
      .from('list_items')
      .insert({
        list_id: listId,
        content_id: contentId,
        added_by: userId,
        position,
        notes,
      })
      .select('*, content(*)')
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity(listId, userId, 'item_added', contentId);

    // Update item count
    await supabase.rpc('increment_list_item_count', { list_id: listId });

    return item;
  },

  // Remove item from list
  async removeItem(listId: string, userId: string, itemId: string) {
    const { data: item, error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      .eq('list_id', listId)
      .select('content_id')
      .single();

    if (error) throw error;

    await this.logActivity(listId, userId, 'item_removed', item.content_id);
    await supabase.rpc('decrement_list_item_count', { list_id: listId });
  },

  // Reorder items
  async reorderItems(listId: string, userId: string, itemIds: string[]) {
    const updates = itemIds.map((id, index) => ({
      id,
      list_id: listId,
      position: index,
    }));

    const { error } = await supabase
      .from('list_items')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;

    await this.logActivity(listId, userId, 'reordered');
  },

  // Invite collaborator
  async inviteCollaborator(listId: string, inviterId: string, userId: string, role: 'editor' | 'viewer') {
    const { data, error } = await supabase
      .from('list_collaborators')
      .insert({
        list_id: listId,
        user_id: userId,
        role,
        invited_by: inviterId,
      })
      .select('*, user:profiles!user_id(username, avatar_url)')
      .single();

    if (error) throw error;
    return data;
  },

  // Remove collaborator
  async removeCollaborator(listId: string, userId: string) {
    const { error } = await supabase
      .from('list_collaborators')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Update collaborator role
  async updateCollaboratorRole(listId: string, userId: string, role: 'editor' | 'viewer') {
    const { error } = await supabase
      .from('list_collaborators')
      .update({ role })
      .eq('list_id', listId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get user's role in list
  getUserRole(list: any, userId: string): 'owner' | 'editor' | 'viewer' | null {
    if (list.owner_id === userId) return 'owner';
    const collab = list.collaborators?.find((c: any) => c.user_id === userId);
    return collab?.role || null;
  },

  // Log activity
  async logActivity(listId: string, userId: string, action: string, contentId?: string) {
    await supabase.from('list_activity').insert({
      list_id: listId,
      user_id: userId,
      action,
      content_id: contentId,
    });
  },
};
```

## Frontend Hooks

```typescript
// features/lists/hooks/use-list.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listApi } from '@/lib/api';

export const listKeys = {
  all: ['lists'] as const,
  user: (userId: string) => [...listKeys.all, 'user', userId] as const,
  detail: (id: string) => [...listKeys.all, 'detail', id] as const,
};

export function useList(listId: string) {
  return useQuery({
    queryKey: listKeys.detail(listId),
    queryFn: () => listApi.getList(listId),
  });
}

export function useUserLists(userId: string) {
  return useQuery({
    queryKey: listKeys.user(userId),
    queryFn: () => listApi.getUserLists(userId),
  });
}

export function useAddListItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: string) => listApi.addItem(listId, contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}

export function useRemoveListItem(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => listApi.removeItem(listId, itemId),
    onMutate: async (itemId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: listKeys.detail(listId) });
      const previous = queryClient.getQueryData(listKeys.detail(listId));

      queryClient.setQueryData(listKeys.detail(listId), (old: any) => ({
        ...old,
        items: old.items.filter((item: any) => item.id !== itemId),
      }));

      return { previous };
    },
    onError: (err, itemId, context) => {
      queryClient.setQueryData(listKeys.detail(listId), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    },
  });
}

export function useReorderListItems(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemIds: string[]) => listApi.reorderItems(listId, itemIds),
    onMutate: async (itemIds) => {
      await queryClient.cancelQueries({ queryKey: listKeys.detail(listId) });
      const previous = queryClient.getQueryData(listKeys.detail(listId));

      queryClient.setQueryData(listKeys.detail(listId), (old: any) => {
        const itemMap = new Map(old.items.map((item: any) => [item.id, item]));
        const reordered = itemIds.map((id, index) => ({
          ...itemMap.get(id),
          position: index,
        }));
        return { ...old, items: reordered };
      });

      return { previous };
    },
    onError: (err, itemIds, context) => {
      queryClient.setQueryData(listKeys.detail(listId), context?.previous);
    },
  });
}
```

## Frontend Components

### List Card

```typescript
// features/lists/components/ListCard.tsx
import { Link } from 'react-router-dom';
import { Card, CardImage, CardBody } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';
import type { List } from '@/types/lists';

interface ListCardProps {
  list: List;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <Card as={Link} to={`/lists/${list.id}`} interactive>
      <CardImage
        src={list.coverUrl || '/default-list-cover.jpg'}
        alt={list.name}
      />
      <CardBody>
        <h3 className="list-card__name">{list.name}</h3>
        <p className="list-card__count">{list.itemCount} items</p>
        
        <div className="list-card__meta">
          <Avatar src={list.owner.avatarUrl} size="sm" />
          <span>{list.owner.username}</span>
          
          {list.isCollaborative && (
            <span className="list-card__badge">
              <Icon name="users" size="sm" />
              {list.collaborators.length + 1}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
```

### Drag & Drop Reordering

```typescript
// features/lists/components/ListItems.tsx
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReorderListItems } from '../hooks/use-list';

interface ListItemsProps {
  listId: string;
  items: ListItem[];
  canEdit: boolean;
}

export function ListItems({ listId, items, canEdit }: ListItemsProps) {
  const reorder = useReorderListItems(listId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);

    const newOrder = arrayMove(items, oldIndex, newIndex).map(i => i.id);
    reorder.mutate(newOrder);
  };

  if (!canEdit) {
    return (
      <div className="list-items">
        {items.map(item => (
          <ListItemCard key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="list-items">
          {items.map(item => (
            <SortableListItem key={item.id} item={item} listId={listId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableListItem({ item, listId }: { item: ListItem; listId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ListItemCard item={item} dragHandleProps={listeners} listId={listId} />
    </div>
  );
}
```

### Invite Collaborator Modal

```typescript
// features/lists/components/InviteCollaboratorModal.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button, Input, Select } from '@/components/ui';
import { useInviteCollaborator } from '../hooks/use-collaborators';

interface InviteCollaboratorModalProps {
  listId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteCollaboratorModal({ listId, isOpen, onClose }: InviteCollaboratorModalProps) {
  const invite = useInviteCollaborator(listId);
  const { register, handleSubmit, reset } = useForm<{ username: string; role: 'editor' | 'viewer' }>();

  const onSubmit = async (data: { username: string; role: 'editor' | 'viewer' }) => {
    await invite.mutateAsync(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Invitar colaborador</ModalHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalBody>
          <Input
            label="Usuario"
            placeholder="username"
            {...register('username', { required: true })}
          />
          <Select label="Rol" {...register('role')}>
            <option value="editor">Editor (puede agregar/quitar)</option>
            <option value="viewer">Viewer (solo ver)</option>
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" isLoading={invite.isPending}>Invitar</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
```

## Synchronization Strategy

### Phase 1: Polling (MVP)

```typescript
// features/lists/hooks/use-list-sync.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { listKeys } from './use-list';

export function useListSync(listId: string, isCollaborative: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isCollaborative) return;

    // Poll every 30 seconds for collaborative lists
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
    }, 30000);

    return () => clearInterval(interval);
  }, [listId, isCollaborative, queryClient]);
}
```

### Phase 2: Supabase Realtime (Future)

```typescript
// features/lists/hooks/use-list-realtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { listKeys } from './use-list';

export function useListRealtime(listId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`list:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'list_items',
          filter: `list_id=eq.${listId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: listKeys.detail(listId) });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [listId, queryClient]);
}
```

## Conflict Resolution

For collaborative editing, use "last write wins" with user notification:

```typescript
// Show toast when list was updated by another user
function handleExternalUpdate(oldData: List, newData: List) {
  const oldItemIds = new Set(oldData.items.map(i => i.id));
  const newItemIds = new Set(newData.items.map(i => i.id));

  const added = newData.items.filter(i => !oldItemIds.has(i.id));
  const removed = oldData.items.filter(i => !newItemIds.has(i.id));

  if (added.length > 0 || removed.length > 0) {
    showToast({
      title: 'Lista actualizada',
      description: `${added.length} agregados, ${removed.length} removidos por otro colaborador`,
    });
  }
}
```

## Testing

```typescript
describe('List Service', () => {
  it('creates a list', async () => {
    const list = await listService.createList(userId, {
      name: 'My Favorites',
      isPublic: false,
    });
    expect(list.name).toBe('My Favorites');
    expect(list.owner_id).toBe(userId);
  });

  it('enforces editor permissions', async () => {
    // Viewer cannot add items
    await expect(
      listService.addItem(listId, viewerUserId, contentId)
    ).rejects.toThrow();
  });

  it('reorders items correctly', async () => {
    await listService.reorderItems(listId, userId, ['c', 'a', 'b']);
    const list = await listService.getList(listId);
    expect(list.items.map(i => i.id)).toEqual(['c', 'a', 'b']);
  });
});
```