import { api } from './api'
import type { UserList, UserListItem } from '@/types'

export const listService = {
  async getLists(): Promise<UserList[]> {
    const { data } = await api.get<UserList[]>('/lists')
    return data
  },

  async getListById(listId: string): Promise<UserList> {
    const { data } = await api.get<UserList>(`/lists/${listId}`)
    return data
  },

  async createList(list: Pick<UserList, 'name' | 'description' | 'isPublic'>): Promise<UserList> {
    const { data } = await api.post<UserList>('/lists', list)
    return data
  },

  async updateList(listId: string, updates: Partial<Pick<UserList, 'name' | 'description' | 'isPublic'>>): Promise<UserList> {
    const { data } = await api.patch<UserList>(`/lists/${listId}`, updates)
    return data
  },

  async deleteList(listId: string): Promise<void> {
    await api.delete(`/lists/${listId}`)
  },

  async addItemToList(listId: string, contentId: string): Promise<UserListItem> {
    const { data } = await api.post<UserListItem>(`/lists/${listId}/items`, { contentId })
    return data
  },

  async removeItemFromList(listId: string, itemId: string): Promise<void> {
    await api.delete(`/lists/${listId}/items/${itemId}`)
  },

  async reorderItems(listId: string, itemIds: string[]): Promise<void> {
    await api.patch(`/lists/${listId}/reorder`, { itemIds })
  },
}
