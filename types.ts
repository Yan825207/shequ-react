
export interface UserInfo {
  id: number;
  nickname?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  following_count?: number;
  followers_count?: number;
  posts_count?: number;
}

export interface PostType {
  id: number;
  author: UserInfo;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_followed: boolean;
  createdAt: string;
  images: string[];
}

export interface ProductType {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  sub_category?: string;
  status: string;
  authorId: number;
  isSold: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  author: UserInfo;
  images: string[];
}

export interface CommentType {
  id: number;
  content: string;
  postId?: number;
  productId?: number;
  userId: number;
  user: UserInfo;
  createdAt: string;
  nickname?: string;
  avatar?: string;
  created_at?: string;
  replies?: CommentType[];
  parentCommentId?: number;
}

export interface MessageType {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  sender?: UserInfo;
  receiver?: UserInfo;
  read?: boolean;
}
