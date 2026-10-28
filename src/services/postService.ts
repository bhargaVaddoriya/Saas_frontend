import axiosClient from './api/axiosClient'
import type { Post } from '../types'

export const postService = {
  // Fetch posts with optional limit
  async getPosts(limit: number = 8): Promise<Post[]> {
    const response = await axiosClient.get<Post[]>(`/posts?_limit=${limit}`)
    return response.data
  },

  // Fetch single post by ID
  async getPostById(id: number): Promise<Post> {
    const response = await axiosClient.get<Post>(`/posts/${id}`)
    return response.data
  },

  // Create new post
  async createPost(data: Omit<Post, 'id'>): Promise<Post> {
    const response = await axiosClient.post<Post>('/posts', data)
    return response.data
  },

  // Delete post
  async deletePost(id: number): Promise<void> {
    await axiosClient.delete(`/posts/${id}`)
  },
}
