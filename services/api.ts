
import { request, BASE_URL, formatUrl } from '../utils/request';
import { UserInfo, PostType, ProductType, CommentType, MessageType } from '../types';
import { API_BASE_URL } from '../constants';

const uni = (window as any).uni;

export class ApiService {
  token: string | null = null;

  async request(url: string, options: any = {}) {
    return request({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : options.data,
      header: options.headers
    });
  }

  async login(email: string, password: string): Promise<UserInfo> {
    const res: any = await this.request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    this.token = res.token;
    uni.setStorageSync("token", this.token);
    return res.user;
  }

  async register(data: { username: string; email: string; password: string; nickname?: string }) {
    return await this.request("/users/register", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }

  async getCurrentUser(): Promise<UserInfo | null> {
    if (!this.token) this.token = uni.getStorageSync("token");
    if (!this.token) return null;
    try {
      const res: any = await this.request("/users/profile");
      return res;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  async updateProfile(data: { nickname?: string; bio?: string; avatar?: string; password?: string }): Promise<UserInfo> {
    const res: any = await this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data)
    });
    return res;
  }

  logout() {
    this.token = null;
    uni.removeStorageSync("token");
  }

  async getUser(id: number): Promise<UserInfo> {
    const res: any = await this.request(`/users/${id}`);
    return res;
  }

  async uploadFile(file: File): Promise<string> {
    const urls = await this.uploadFiles([file]);
    return urls[0] || "";
  }

  async uploadFiles(files: File[]): Promise<string[]> {
    if (!this.token) {
        this.token = uni.getStorageSync("token");
    }
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : Array.from(files);
    
    fileList.forEach((file: any) => {
      formData.append("files", file);
    });
    
    const response = await fetch(`${API_BASE_URL}/uploads/multiple`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.token}` },
      body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "上传失败");
    
    // Normalize result to an array to handle various backend response structures
    let list: any[] = [];
    
    // Handle specific case: { data: { files: [...] } }
    if (result.data && result.data.files && Array.isArray(result.data.files)) {
        list = result.data.files;
    } 
    // Handle standard array response
    else if (Array.isArray(result)) {
        list = result;
    } 
    // Handle { data: [...] }
    else if (result.data && Array.isArray(result.data)) {
        list = result.data;
    } 
    // Handle single object wrapped in data
    else if (result.data) {
        list = [result.data];
    } 
    // Handle fallback single object
    else {
        list = [result];
    }
    
    return list.map((item: any) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        // Prioritize 'url' as seen in the user's JSON, then 'fileUrl'
        return item.url || item.fileUrl || '';
    }).filter((url: string) => url && typeof url === 'string' && url.length > 0);
  }

  async getPosts(page = 1, userId?: number) {
    const url = userId ? `/posts/user/${userId}?page=${page}` : `/posts?page=${page}`;
    const res: any = await this.request(url);
    const list = (res.list || []).map((p: any) => this.mapPost(p));
    return {
      list,
      hasMore: res.pagination ? res.pagination.page < res.pagination.pages : false
    };
  }

  async getPostDetail(id: number): Promise<PostType> {
    const res: any = await this.request(`/posts/${id}`);
    return this.mapPost(res);
  }

  async createPost(content: string, category: string, images: string[]) {
    return await this.request("/posts", {
      method: "POST",
      body: JSON.stringify({ 
        title: content.slice(0, 20) || "无标题", 
        content, 
        category,
        images
      })
    });
  }

  async getComments(postId: number): Promise<CommentType[]> {
    const res: any = await this.request(`/comments/post/${postId}`);
    return (res || []).map((c: any) => ({
        ...c,
        nickname: c.User?.nickname || c.User?.username || 'User',
        avatar: c.User?.avatar,
        created_at: c.createdAt
    }));
  }
  
  async getProductComments(productId: number): Promise<CommentType[]> {
    try {
        const res: any = await this.request(`/comments/post/${productId}`); 
        return (res || []).map((c: any) => ({
            ...c,
            nickname: c.User?.nickname || c.User?.username || 'User',
            avatar: c.User?.avatar,
            created_at: c.createdAt,
            replies: c.replies || []
        }));
    } catch (e) { return []; }
  }

  async postComment(postId: number, content: string) {
    return await this.request(`/comments`, {
      method: 'POST',
      body: JSON.stringify({ postId, content })
    });
  }

  async createComment(data: { postId?: number; productId?: number; content: string; parentCommentId?: number | null }) {
    const payload = {
        postId: data.postId || data.productId,
        content: data.content,
        parentCommentId: data.parentCommentId
    };
    return await this.request(`/comments`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async likePost(postId: number, isLiked: boolean) {
    const method = isLiked ? "DELETE" : "POST";
    const endpoint = isLiked ? `/likes?target_id=${postId}&target_type=post` : `/likes`;
    const body = isLiked ? undefined : JSON.stringify({ target_id: postId, target_type: "post" });
    return await this.request(endpoint, { method, body });
  }

  async getConversations(): Promise<MessageType[]> {
    const res: any = await this.request("/messages/list");
    return Array.isArray(res) ? res : [];
  }

  async getChatMessages(userId: number): Promise<MessageType[]> {
    const res: any = await this.request(`/messages/chat/${userId}`);
    return Array.isArray(res) ? res : [];
  }

  async sendMessage(receiverId: number, content: string) {
    return await this.request("/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content })
    });
  }

  // --- Follow APIs ---
  async followUser(followingId: number) {
    return await this.request("/follows", {
      method: "POST",
      body: JSON.stringify({ following_id: String(followingId) })
    });
  }

  async unfollowUser(followingId: number) {
    return await this.request(`/follows/${followingId}`, {
      method: "DELETE"
    });
  }

  async checkFollowStatus(id: number) {
    try {
      const res: any = await this.request(`/follows/check/${id}`);
      return res.is_following || false;
    } catch (e) {
      return false;
    }
  }

  async getFollowers(id: number) {
    const res: any = await this.request(`/follows/followers/${id}`);
    return (res.list || []).map((item: any) => ({
        ...item,
        nickname: item.follower?.nickname || item.follower?.username,
        avatar: item.follower?.avatar,
        id: item.follower?.id 
    }));
  }

  async getFollowing(id: number) {
    const res: any = await this.request(`/follows/following/${id}`);
    return (res.list || []).map((item: any) => ({
        ...item,
        nickname: item.following?.nickname || item.following?.username,
        avatar: item.following?.avatar,
        id: item.following?.id
    }));
  }

  // --- Product (Classifieds) APIs ---
  
  async createProduct(data: { title: string; description: string; price: number; category: string; status?: string; images?: string[] }) {
    return await this.request("/products", {
      method: "POST",
      body: JSON.stringify({
          ...data,
          sub_category: 'electronics' 
      })
    });
  }

  async getProducts(params: { page?: number; pageSize?: number; category?: string; userId?: number } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params.userId) query.append("user_id", params.userId.toString());
    const res: any = await this.request(`/products?${query.toString()}`);
    
    const list = (res.list || []).map((p: any) => this.mapProduct(p));
    return {
      list,
      pagination: res.pagination
    };
  }

  async getProductDetail(id: number): Promise<ProductType> {
    const res: any = await this.request(`/products/${id}`);
    return this.mapProduct(res);
  }

  private mapProduct(p: any): ProductType {
    if (!p) return {} as ProductType;
    const images = p.images || [];

    return {
      id: p.id || p._id,
      title: p.title || '闲置物品',
      description: p.description || '',
      price: Number(p.price) || 0,
      category: p.category || 'other',
      sub_category: p.sub_category,
      status: p.status || '未知',
      authorId: p.user_id || p.userId,
      isSold: p.status === 'sold',
      views: p.views_count || 0,
      createdAt: p.createdAt || p.created_at,
      updatedAt: p.updatedAt || p.updated_at,
      author: {
        ...(p.user_info || p.author || {}),
        avatar: formatUrl(p.user_info?.avatar || p.author?.avatar)
      },
      images: images.map((img: any) => typeof img === 'string' ? img : (img.url || img.fileUrl))
    };
  }

  private mapPost(p: any): PostType {
    const images = p.images || p.media || [];
    return {
      id: p.id,
      author: {
        ...(p.author || {}),
        avatar: formatUrl(p.author?.avatar)
      },
      title: p.title,
      content: p.content,
      category: p.category,
      likes_count: p.likes_count || 0,
      comments_count: p.comments_count || 0,
      is_liked: !!p.is_liked,
      is_followed: !!p.is_followed,
      createdAt: p.createdAt || p.created_at,
      images: images.map((img: any) => typeof img === 'string' ? img : (img.url || img.fileUrl))
    };
  }
}

export const api = new ApiService();
