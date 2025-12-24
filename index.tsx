
import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { 
  Home, 
  Compass, 
  MessageSquare, 
  User, 
  Heart, 
  MessageCircle, 
  Share2, 
  Settings,
  ChevronRight,
  Send,
  Users,
  Loader2,
  LogOut,
  X,
  ArrowLeft,
  RefreshCw,
  Mail,
  Lock,
  Plus,
  FileText,
  Star,
  Bell,
  Edit,
  Trash2,
  FileQuestion,
  Search,
  Zap,
  ShoppingBag,
  Briefcase,
  Home as HomeIcon,
  Wrench,
  Calendar,
  Megaphone,
  Camera,
  UserPlus,
  UserCheck
} from "lucide-react";

// --- 1. 配置与工具 ---

const getBaseHost = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '127.0.0.1';
  }
  return hostname || "127.0.0.1";
};

const SERVER_HOST = `http://${getBaseHost()}:5000`;
const API_BASE_URL = `${SERVER_HOST}/api/v1`;

const CATEGORIES = [
  { label: '公告', value: '公告' },
  { label: '生活', value: '生活' },
  { label: '求助', value: '求助' },
  { label: '活动', value: '活动' },
  { label: '其他', value: '其他' }
];

const COLORS = {
  primary: "#3498db",
  secondary: "#2ecc71",
  danger: "#e74c3c",
  bg: "#f8f9fa",
  textMain: "#2d3436",
  textSub: "#636e72",
  border: "#f1f2f6",
  white: "#ffffff"
};

const normalizeUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const cleanPath = url.replace(/^\/+/, '');
  return `${SERVER_HOST}/${cleanPath}`;
};

const formatTimeAgo = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "刚刚";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
  return `${Math.floor(seconds / 86400)}天前`;
};

// --- 2. 接口定义 ---

interface UserType {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  bio?: string;
  following_count: number;
  followers_count: number;
  posts_count: number;
}

interface PostType {
  id: number;
  author: Partial<UserType>;
  title?: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_followed: boolean;
  createdAt: string;
  images: string[];
}

interface CommentType {
  id: number;
  nickname: string;
  avatar: string;
  content: string;
  created_at: string;
}

interface ConversationType {
  id: number;
  other_id: number;
  other_nickname: string;
  other_avatar: string;
  last_message: string;
  updated_at: string;
}

interface MessageType {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  read: boolean;
  sender: {
    id: number;
    username: string;
    nickname?: string;
    avatar: string;
  };
  receiver: {
    id: number;
    username: string;
    nickname?: string;
    avatar: string;
  };
}

interface AnnouncementType {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface BannerType {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  order: number;
  isActive: boolean;
}

// --- 3. API 服务层 ---

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("community_token");
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || result.error || "请求失败");
      return result;
    } catch (e: any) {
      console.error(`API Error [${endpoint}]:`, e.message);
      throw e;
    }
  }

  async login(email: string, password: string): Promise<UserType> {
    const res = await this.request("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    this.token = res.data.token;
    localStorage.setItem("community_token", this.token!);
    return res.data.user;
  }

  async getCurrentUser(): Promise<UserType | null> {
    if (!this.token) return null;
    try {
      const res = await this.request("/users/profile");
      return res.data;
    } catch (e) {
      this.logout();
      return null;
    }
  }

  async updateProfile(data: { nickname?: string; bio?: string; avatar?: string; password?: string }): Promise<UserType> {
    const res = await this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data)
    });
    return res.data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem("community_token");
  }

  async getUser(id: number): Promise<UserType> {
    const res = await this.request(`/users/${id}`);
    return res.data;
  }

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/uploads/single`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${this.token}` },
      body: formData
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "上传失败");
    return result.data.fileUrl || result.data.url;
  }

  async getPosts(page = 1, userId?: number) {
    const url = userId ? `/posts?page=${page}&user_id=${userId}` : `/posts?page=${page}`;
    const res = await this.request(url);
    const list = (res.data?.list || []).map((p: any) => this.mapPost(p));
    return {
      list,
      hasMore: res.data?.pagination ? res.data.pagination.page < res.data.pagination.pages : false
    };
  }

  async getPostDetail(id: number): Promise<PostType> {
    const res = await this.request(`/posts/${id}`);
    return this.mapPost(res.data);
  }

  async getAnnouncements(): Promise<AnnouncementType[]> {
    const res = await this.request("/announcements");
    return res.data || [];
  }

  async getBanners(): Promise<BannerType[]> {
    const res = await this.request("/banners");
    return res.data || [];
  }

  async createPost(content: string, category: string, images: string[]) {
    return await this.request("/posts", {
      method: "POST",
      body: JSON.stringify({ 
        title: content.slice(0, 20), 
        content, 
        category,
        images
      })
    });
  }

  async getComments(postId: number): Promise<CommentType[]> {
    const res = await this.request(`/comments/post/${postId}`);
    return res.data || [];
  }

  async postComment(postId: number, content: string) {
    return await this.request(`/comments`, {
      method: 'POST',
      body: JSON.stringify({ postId, content })
    });
  }

  async likePost(postId: number, isLiked: boolean) {
    const method = isLiked ? "DELETE" : "POST";
    const endpoint = isLiked ? `/likes?target_id=${postId}&target_type=post` : `/likes`;
    const body = isLiked ? undefined : JSON.stringify({ target_id: postId, target_type: "post" });
    return await this.request(endpoint, { method, body });
  }

  async getConversations(): Promise<MessageType[]> {
    const res = await this.request("/messages/list");
    return Array.isArray(res) ? res : (res.data || []);
  }

  async getChatMessages(userId: number): Promise<MessageType[]> {
    const res = await this.request(`/messages/chat/${userId}`);
    return Array.isArray(res) ? res : (res.data || []);
  }

  async sendMessage(receiverId: number, content: string) {
    const res = await this.request("/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content })
    });
    return res;
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
      const res = await this.request(`/follows/check/${id}`);
      return res.data?.is_following || false;
    } catch (e) {
      return false;
    }
  }

  async getFollowers(id: number) {
    const res = await this.request(`/follows/followers/${id}`);
    return res.data?.list || [];
  }

  async getFollowing(id: number) {
    const res = await this.request(`/follows/following/${id}`);
    return res.data?.list || [];
  }

  private mapPost(p: any): PostType {
    const images = p.images || p.media || [];
    return {
      id: p.id,
      author: {
        ...(p.author || {}),
        avatar: normalizeUrl(p.author?.avatar)
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

const api = new ApiService();

// --- 4. 主应用组件 ---

const App = () => {
  const [view, setView] = useState<{name: string, data?: any}>({ name: 'loading' });
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showPostModal, setShowPostModal] = useState<PostType | boolean>(false);

  useEffect(() => {
    api.getCurrentUser().then(user => {
      if (user && user.id) {
        setCurrentUser(user);
        setView({ name: 'tab', data: 'home' });
      } else {
        setView({ name: 'login' });
      }
    });
  }, []);

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setView({ name: 'login' });
  };

  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    setView({ name: 'tab', data: 'home' });
  };

  const handleUpdateSuccess = (user: UserType) => {
    setCurrentUser(user);
    setView({ name: 'tab', data: 'profile' });
  };

  const navigateTo = (viewName: string, data?: any) => setView({ name: viewName, data });

  if (view.name === 'loading') {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white" }}>
        <Loader2 className="animate-spin" color={COLORS.primary} size={32} />
      </div>
    );
  }

  const renderContent = () => {
    if (view.name === 'login') return <LoginView onLoginSuccess={handleLoginSuccess} />;
    if (view.name === 'postDetail') return <PostDetailView id={view.data} onBack={() => navigateTo('tab', view.data?.from || 'home')} navigateTo={navigateTo} />;
    if (view.name === 'userDetail') return <UserDetailView id={view.data} onBack={() => navigateTo('tab', 'home')} navigateTo={navigateTo} currentUser={currentUser} />;
    if (view.name === 'chatDetail') return <ChatDetailView user={view.data} onBack={() => navigateTo('tab', 'messages')} currentUser={currentUser} />;
    if (view.name === 'editProfile') return <EditProfileView currentUser={currentUser} onBack={() => navigateTo('tab', 'profile')} onUpdate={handleUpdateSuccess} />;
    if (view.name === 'followList') return <FollowListView type={view.data.type} userId={view.data.userId} onBack={() => navigateTo(view.data.from || 'tab', view.data.fromData || 'profile')} navigateTo={navigateTo} />;
    
    const tab = view.data;
    switch(tab) {
      case 'home': return <HomeView currentUser={currentUser} navigateTo={navigateTo} />;
      case 'discovery': return <DiscoveryView navigateTo={navigateTo} />;
      case 'messages': return <MessagesView navigateTo={navigateTo} currentUser={currentUser} />;
      case 'profile': return currentUser ? <ProfileView user={currentUser} onLogout={handleLogout} navigateTo={navigateTo} /> : null;
      default: return null;
    }
  };

  const showTabBar = view.name === 'tab';

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: COLORS.bg }}>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {renderContent()}
      </div>

      {showTabBar && (
        <div style={{ height: 60, backgroundColor: COLORS.white, borderTop: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100 }}>
          <TabItem icon={<Home size={22} />} active={view.data === 'home'} label="首页" onClick={() => setView({name:'tab', data:'home'})} />
          <TabItem icon={<Compass size={22} />} active={view.data === 'discovery'} label="发现" onClick={() => setView({name:'tab', data:'discovery'})} />
          <div onClick={() => setShowPostModal(true)} style={{ width: 48, height: 48, backgroundColor: COLORS.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", marginTop: -20, boxShadow: "0 4px 12px rgba(52, 152, 219, 0.3)", cursor: "pointer" }}>
            <Plus size={24} />
          </div>
          <TabItem icon={<MessageSquare size={22} />} active={view.data === 'messages'} label="消息" onClick={() => setView({name:'tab', data:'messages'})} />
          <TabItem icon={<User size={22} />} active={view.data === 'profile'} label="我的" onClick={() => setView({name:'tab', data:'profile'})} />
        </div>
      )}

      {showPostModal && (
        <PostModal 
          editPost={typeof showPostModal === 'object' ? showPostModal : undefined} 
          onClose={() => setShowPostModal(false)} 
          onPosted={() => window.dispatchEvent(new Event('refresh'))} 
        />
      )}
    </div>
  );
};

// --- 5. 视图组件 ---

const LoginView = ({ onLoginSuccess }: { onLoginSuccess: (user: UserType) => void }) => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await api.login(email, password);
      onLoginSuccess(user);
    } catch (e: any) {
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", backgroundColor: "white" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, backgroundColor: COLORS.primary, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "white" }}>
          <Users size={40} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textMain }}>社区邻里</h1>
        <p style={{ color: COLORS.textSub, fontSize: 14 }}>开启您的美好社区生活</p>
      </div>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <Mail style={{ position: "absolute", left: 15, top: 14, color: COLORS.textSub }} size={18} />
          <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "14px 15px 14px 45px", borderRadius: 12, border: `1px solid ${COLORS.border}`, outline: "none", fontSize: 15, backgroundColor: "#f9fafb" }} />
        </div>
        <div style={{ position: "relative" }}>
          <Lock style={{ position: "absolute", left: 15, top: 14, color: COLORS.textSub }} size={18} />
          <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "14px 15px 14px 45px", borderRadius: 12, border: `1px solid ${COLORS.border}`, outline: "none", fontSize: 15, backgroundColor: "#f9fafb" }} />
        </div>
        {error && <div style={{ color: COLORS.danger, fontSize: 12, textAlign: "center" }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 16, backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : "登 录"}
        </button>
      </form>
    </div>
  );
};

const BannerCarousel = ({ banners }: { banners: BannerType[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden", backgroundColor: "#f0f0f0" }}>
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: current === index ? 1 : 0,
            transition: "opacity 0.5s ease-in-out",
            zIndex: current === index ? 1 : 0,
          }}
          onClick={() => banner.linkUrl && alert(`跳转至: ${banner.linkUrl}`)}
        >
          <img
            src={normalizeUrl(banner.imageUrl)}
            alt={banner.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            crossOrigin="anonymous"
          />
        </div>
      ))}
      <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 6, zIndex: 2 }}>
        {banners.map((_, index) => (
          <div
            key={index}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: current === index ? COLORS.primary : "rgba(255, 255, 255, 0.7)",
              transition: "background-color 0.3s"
            }}
          />
        ))}
      </div>
    </div>
  );
};

const AnnouncementBar = ({ announcements }: { announcements: AnnouncementType[] }) => {
  if (announcements.length === 0) return null;
  const text = announcements.map(a => `${a.title}: ${a.content}`).join("    |    ");
  return (
    <div style={{ backgroundColor: "#fff7e6", color: "#fa8c16", padding: "10px 15px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, borderBottom: `1px solid ${COLORS.border}` }}>
      <Megaphone size={16} />
      <div style={{ flex: 1, overflow: "hidden", whiteSpace: "nowrap" }}>
         <div style={{ display: "inline-block", paddingLeft: "100%", animation: "marquee 40s linear infinite" }}>
           {text}
         </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-100%, 0); }
        }
      `}</style>
    </div>
  );
};

const HomeView = ({ currentUser, navigateTo }: { currentUser: UserType | null, navigateTo: (v: string, d?: any) => void }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementType[]>([]);
  const [banners, setBanners] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (refresh = false) => {
    if (loading && !refresh) return;
    setLoading(true);
    if (refresh) setRefreshing(true);
    try {
      const res = await api.getPosts(refresh ? 1 : page);
      if (refresh) {
        setPosts(res.list);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...res.list]);
        setPage(prev => prev + 1);
      }
      setHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    api.getAnnouncements().then(setAnnouncements).catch(console.error);
    api.getBanners().then(setBanners).catch(console.error);
    const handler = () => fetchData(true);
    window.addEventListener('refresh', handler);
    return () => window.removeEventListener('refresh', handler);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !loading) {
      fetchData();
    }
  };

  return (
    <div onScroll={handleScroll} style={{ height: "100%", overflowY: "auto", paddingBottom: 60 }}>
      <div style={{ position: "sticky", top: 0, backgroundColor: "white", padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>推荐内容</h2>
        <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} onClick={() => fetchData(true)} style={{ color: COLORS.primary, cursor: "pointer" }} />
      </div>
      <BannerCarousel banners={banners} />
      <AnnouncementBar announcements={announcements} />
      <div>
        {posts.map(post => <PostCard key={post.id} post={post} onLike={() => api.likePost(post.id, post.is_liked)} onClick={() => navigateTo('postDetail', post.id)} onUserClick={() => post.author?.id && navigateTo('userDetail', post.author.id)} />)}
        {loading && <div style={{ padding: 20, textAlign: "center" }}><Loader2 className="animate-spin" size={24} color={COLORS.primary} /></div>}
        {!hasMore && posts.length > 0 && <div style={{ padding: 20, textAlign: "center", color: "#ccc", fontSize: 12 }}>— 已经到底啦 —</div>}
      </div>
    </div>
  );
};

const DiscoveryView = ({ navigateTo }: { navigateTo: (v: string, d?: any) => void }) => {
  const categories = [
    { label: '二手交易', icon: <ShoppingBag size={24} />, color: '#ff7675' },
    { label: '求职招聘', icon: <Briefcase size={24} />, color: '#74b9ff' },
    { label: '房屋出租', icon: <HomeIcon size={24} />, color: '#55efc4' },
    { label: '生活服务', icon: <Wrench size={24} />, color: '#ffeaa7' },
  ];

  const activities = [
    { id: 1, title: '社区周末跳蚤市场', date: '本周六 09:00', location: '1号楼中庭', image: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=400&q=80', participants: 45 },
    { id: 2, title: '邻里羽毛球友谊赛', date: '10月15日 14:00', location: '社区体育馆', image: 'https://images.unsplash.com/photo-1626224580194-860c47ff9389?auto=format&fit=crop&w=400&q=80', participants: 12 },
    { id: 3, title: '社区公益植树活动', date: '11月1日 08:30', location: '社区北侧草坪', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&w=400&q=80', participants: 30 },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingBottom: 60, backgroundColor: COLORS.bg }}>
      {/* Search Bar */}
      <div style={{ position: "sticky", top: 0, backgroundColor: "white", padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}`, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", backgroundColor: "#f1f2f6", padding: "8px 12px", borderRadius: 10, gap: 10 }}>
          <Search size={18} color={COLORS.textSub} />
          <input placeholder="搜索活动、二手、资讯..." style={{ border: "none", background: "none", fontSize: 14, outline: "none", flex: 1 }} />
        </div>
      </div>

      {/* Banner */}
      <div style={{ padding: 15 }}>
        <div style={{ width: "100%", height: 160, borderRadius: 20, background: `linear-gradient(45deg, ${COLORS.primary}, #6c5ce7)`, padding: 25, color: "white", position: "relative", overflow: "hidden", boxShadow: "0 10px 20px rgba(52, 152, 219, 0.2)" }}>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 22, fontWeight: 800 }}>新成员福利</h3>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.9, maxWidth: "70%" }}>领取邻里积分，兑换周边商超优惠券，开启省钱社区生活</p>
            <button style={{ marginTop: 15, padding: "8px 20px", borderRadius: 20, border: "none", backgroundColor: "white", color: COLORS.primary, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>立即领取</button>
          </div>
          <Zap size={140} style={{ position: "absolute", right: -30, bottom: -30, opacity: 0.15, color: "white" }} />
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", padding: "10px 15px 25px", gap: 15, backgroundColor: "white", margin: "0 15px 15px", borderRadius: 16 }}>
        {categories.map((cat, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 54, height: 54, borderRadius: 18, backgroundColor: `${cat.color}15`, color: cat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {cat.icon}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMain }}>{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Trending Topics */}
      <div style={{ padding: "0 15px 25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: COLORS.textMain }}>热门话题</h3>
          <span style={{ fontSize: 13, color: COLORS.primary, fontWeight: 600, cursor: "pointer" }}>查看更多</span>
        </div>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 5, scrollbarWidth: "none" }}>
          {['# 文明养犬', '# 垃圾分类', '# 周末去哪儿', '# 社区美食', '# 房屋维修'].map((tag, i) => (
            <div key={i} style={{ padding: "8px 16px", borderRadius: 25, backgroundColor: "white", border: `1px solid ${COLORS.border}`, fontSize: 13, whiteSpace: "nowrap", color: COLORS.textSub, boxShadow: "0 2px 5px rgba(0,0,0,0.02)", cursor: "pointer" }}>{tag}</div>
          ))}
        </div>
      </div>

      {/* Nearby Activities */}
      <div style={{ padding: "0 15px 30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: COLORS.textMain }}>周边活动</h3>
          <Calendar size={20} color={COLORS.textSub} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {activities.map(act => (
            <div key={act.id} style={{ display: "flex", backgroundColor: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.04)", cursor: "pointer" }}>
              <img src={act.image} style={{ width: 110, height: 110, objectFit: "cover" }} />
              <div style={{ flex: 1, padding: 15, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.textMain, marginBottom: 4 }}>{act.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.textSub }}>{act.date} · {act.location}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: COLORS.primary, fontWeight: 600 }}>{act.participants} 人已报名</span>
                  <button style={{ padding: "5px 14px", borderRadius: 15, border: "none", backgroundColor: COLORS.primary, color: "white", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>去报名</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MessagesView = ({ navigateTo, currentUser }: { navigateTo: (v: string, d?: any) => void, currentUser: UserType | null }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConvs = async () => {
    try {
      const data = await api.getConversations();
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConvs();
    const timer = setInterval(loadConvs, 10000); 
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" size={24} color={COLORS.primary} /></div>;

  return (
    <div style={{ height: "100%", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>消息中心</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.length > 0 ? (
          messages.map(msg => {
            const otherUser = msg.senderId === currentUser?.id ? msg.receiver : msg.sender;
            const nickname = otherUser.nickname || otherUser.username;
            const avatar = otherUser.avatar;
            const showBadge = !msg.read && msg.receiverId === currentUser?.id;

            return (
              <div 
                key={msg.id} 
                onClick={() => navigateTo('chatDetail', { id: otherUser.id, nickname: nickname, avatar: avatar })}
                style={{ display: "flex", padding: "15px", borderBottom: `1px solid ${COLORS.border}`, gap: 12, cursor: "pointer" }}
              >
                <div style={{ position: "relative" }}>
                  <img 
                    src={normalizeUrl(avatar) || `https://ui-avatars.com/api/?name=${nickname}`} 
                    style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover" }} 
                    crossOrigin="anonymous" 
                  />
                  {showBadge && (
                    <div style={{ 
                      position: "absolute", 
                      top: -2, 
                      right: -2, 
                      backgroundColor: COLORS.danger, 
                      width: 12, 
                      height: 12, 
                      borderRadius: "50%", 
                      border: "2px solid white" 
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{nickname}</span>
                    <span style={{ fontSize: 12, color: COLORS.textSub }}>{formatTimeAgo(msg.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.textSub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                    {msg.content || '暂无消息'}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: 100, textAlign: "center", color: "#ccc" }}>
            <MessageSquare size={64} style={{ marginBottom: 15, opacity: 0.5 }} />
            <div>暂无私信内容</div>
          </div>
        )}
      </div>
    </div>
  );
};

const ChatDetailView = ({ user, onBack, currentUser }: { user: any, onBack: () => void, currentUser: UserType | null }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user?.id) return;
    try {
      const data = await api.getChatMessages(user.id);
      setMessages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMessages();
      const timer = setInterval(fetchMessages, 5000);
      return () => clearInterval(timer);
    }
  }, [user?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id || !currentUser?.id) return;
    const content = inputText;
    setInputText("");
    try {
      const msgData = await api.sendMessage(user.id, content);
      setMessages(prev => [...prev, msgData]);
    } catch (e) {
      alert("发送失败");
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "#f1f2f6" }}>
      <div style={{ padding: "12px 15px", backgroundColor: "white", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 15 }}>
        <ArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
        <span style={{ fontWeight: 600 }}>{user?.nickname || '聊天'}</span>
      </div>
      
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 15, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ 
            display: "flex", 
            flexDirection: msg.senderId === currentUser.id ? "row-reverse" : "row",
            alignItems: "flex-start",
            gap: 10
          }}>
            <img 
              src={msg.senderId === currentUser.id ? normalizeUrl(currentUser.avatar) : normalizeUrl(user?.avatar) || `https://ui-avatars.com/api/?name=${user?.nickname}`} 
              style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} 
              crossOrigin="anonymous" 
            />
            <div style={{ 
              backgroundColor: msg.senderId === currentUser.id ? COLORS.primary : "white",
              color: msg.senderId === currentUser.id ? "white" : COLORS.textMain,
              padding: "10px 14px",
              borderRadius: 16,
              fontSize: 14,
              maxWidth: "70%",
              wordBreak: "break-all",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "10px 15px", backgroundColor: "white", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, alignItems: "center" }}>
        <input 
          placeholder="输入消息..." 
          value={inputText} 
          onChange={e => setInputText(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ flex: 1, border: "none", backgroundColor: COLORS.bg, padding: "10px 15px", borderRadius: 20, outline: "none" }}
        />
        <Send 
          size={20} 
          color={inputText ? COLORS.primary : "#ccc"} 
          onClick={handleSend} 
          style={{ cursor: "pointer" }} 
        />
      </div>
    </div>
  );
};

const PostDetailView = ({ id, onBack, navigateTo }: { id: any, onBack: () => void, navigateTo: (v: string, d?: any) => void }) => {
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const postId = (id && typeof id === 'object' && id !== null) ? id.id : id;

  const loadData = async () => {
    if (!postId) return;
    setLoading(true);
    setNotFound(false);
    try {
      const p = await api.getPostDetail(postId);
      if (!p) {
        setNotFound(true);
        return;
      }
      setPost(p);
      const cs = await api.getComments(postId);
      setComments(cs);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) loadData();
  }, [postId]);

  const handleSendComment = async () => {
    if (!commentText.trim() || !postId) return;
    try {
      await api.postComment(postId, commentText);
      setCommentText("");
      const cs = await api.getComments(postId);
      setComments(cs);
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white" }}><Loader2 className="animate-spin" color={COLORS.primary} size={32} /></div>;
  
  if (notFound) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "white", padding: 40, textAlign: 'center' }}>
      <FileQuestion size={80} color="#ccc" style={{ marginBottom: 20 }} />
      <h3 style={{ color: COLORS.textMain, marginBottom: 10 }}>该动态不存在或已被删除</h3>
      <p style={{ color: COLORS.textSub, marginBottom: 30, fontSize: 14 }}>你可以去看看其他邻居们的精彩瞬间</p>
      <button 
        onClick={onBack}
        style={{ padding: "12px 30px", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: 25, fontWeight: 600, cursor: "pointer" }}
      >
        返回上一页
      </button>
    </div>
  );

  if (!post) return null;

  return (
    <div style={{ height: "100%", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 15 }}>
        <ArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
        <span style={{ fontWeight: 600 }}>详情</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 15 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 15 }} onClick={() => post.author?.id && navigateTo('userDetail', post.author.id)}>
          <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.username || 'user'}`} style={{ width: 44, height: 44, borderRadius: "50%" }} crossOrigin="anonymous" />
          <div>
            <div style={{ fontWeight: 600 }}>{post.author?.nickname || post.author?.username}</div>
            <div style={{ fontSize: 12, color: COLORS.textSub }}>{formatTimeAgo(post.createdAt)} · {post.category}</div>
          </div>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 15, whiteSpace: "pre-wrap", color: COLORS.textMain }}>{post.content}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 30 }}>
          {post.images.map((img, i) => <img key={i} src={normalizeUrl(img)} style={{ width: "100%", borderRadius: 12, display: "block" }} crossOrigin="anonymous" />)}
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>评论 ({comments.length})</h3>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 15 }}>
              <img src={normalizeUrl(c.avatar) || `https://ui-avatars.com/api/?name=${c.nickname}`} style={{ width: 32, height: 32, borderRadius: "50%" }} crossOrigin="anonymous" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nickname}</div>
                <div style={{ fontSize: 14, color: COLORS.textMain, margin: "4px 0" }}>{c.content}</div>
                <div style={{ fontSize: 12, color: COLORS.textSub }}>{formatTimeAgo(c.created_at)}</div>
              </div>
            </div>
          ))}
          {comments.length === 0 && <div style={{ textAlign: "center", color: "#ccc", padding: 20 }}>暂无评论</div>}
        </div>
      </div>
      
      <div style={{ padding: "10px 15px", borderTop: `1px solid ${COLORS.border}`, backgroundColor: "white", display: "flex", gap: 10, alignItems: "center" }}>
        <input 
          placeholder="写下你的评论..." 
          value={commentText} 
          onChange={e => setCommentText(e.target.value)} 
          style={{ flex: 1, border: "none", backgroundColor: COLORS.bg, padding: "10px 15px", borderRadius: 20, outline: "none" }}
        />
        <Send 
          size={20} 
          color={commentText ? COLORS.primary : "#ccc"} 
          onClick={handleSendComment} 
          style={{ cursor: "pointer" }} 
        />
      </div>
    </div>
  );
};

const UserDetailView = ({ id, onBack, navigateTo, currentUser }: { id: number, onBack: () => void, navigateTo: (v: string, d?: any) => void, currentUser: UserType | null }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getUser(id),
      api.getPosts(1, id),
      currentUser?.id && currentUser.id !== id ? api.checkFollowStatus(id) : Promise.resolve(false)
    ]).then(([u, ps, followingStatus]) => {
      setUser(u);
      setFollowersCount(u.followers_count || 0);
      setPosts(ps.list);
      setIsFollowing(followingStatus);
    }).catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!user) return;
    try {
      if (isFollowing) {
        await api.unfollowUser(user.id);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await api.followUser(user.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (e: any) {
      alert("操作失败: " + e.message);
    }
  };

  if (loading) return <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white" }}><Loader2 className="animate-spin" color={COLORS.primary} size={32} /></div>;
  if (!user) return <div style={{ padding: 20, textAlign: 'center' }}>用户不存在</div>;

  const isMe = currentUser?.id === user.id;

  return (
    <div style={{ height: "100%", backgroundColor: COLORS.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 15, backgroundColor: "white" }}>
        <ArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
        <span style={{ fontWeight: 600 }}>个人主页</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ backgroundColor: "white", padding: 25, textAlign: "center", marginBottom: 10 }}>
          <img src={normalizeUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.username}`} style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${COLORS.border}`, marginBottom: 15, objectFit: "cover" }} crossOrigin="anonymous" />
          <h2 style={{ fontSize: 20, margin: "0 0 5px 0" }}>{user.nickname || user.username}</h2>
          <p style={{ fontSize: 14, color: COLORS.textSub, margin: "0 0 15px 0" }}>{user.bio || "这个人很懒，什么都没写"}</p>
          
          <div style={{ display: "flex", justifyContent: "center", gap: 30, marginBottom: 20 }}>
            <StatItem label="动态" count={user.posts_count || 0} />
            <StatItem label="获赞" count={0} />
            <StatItem label="粉丝" count={followersCount} onClick={() => navigateTo('followList', { type: 'followers', userId: user.id, fromData: user.id, from: 'userDetail' })} />
            <StatItem label="关注" count={user.following_count || 0} onClick={() => navigateTo('followList', { type: 'following', userId: user.id, fromData: user.id, from: 'userDetail' })} />
          </div>

          {!isMe && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={() => navigateTo('chatDetail', { id: user.id, nickname: user.nickname || user.username, avatar: user.avatar })}
                style={{ padding: "8px 24px", borderRadius: 20, border: `1px solid ${COLORS.primary}`, backgroundColor: "white", color: COLORS.primary, fontWeight: 600, cursor: "pointer" }}
              >
                私信
              </button>
              <button 
                onClick={handleFollowToggle}
                style={{ padding: "8px 24px", borderRadius: 20, border: isFollowing ? `1px solid ${COLORS.border}` : "none", backgroundColor: isFollowing ? "white" : COLORS.primary, color: isFollowing ? COLORS.textSub : "white", fontWeight: 600, cursor: "pointer", display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {isFollowing ? <><UserCheck size={16}/> 已关注</> : <><UserPlus size={16}/> 关注</>}
              </button>
            </div>
          )}
        </div>
        <div>
          <div style={{ padding: "15px", fontSize: 14, fontWeight: 700, color: COLORS.textSub }}>发布的动态</div>
          {posts.map(post => <PostCard key={post.id} post={post} onLike={() => api.likePost(post.id, post.is_liked)} onClick={() => navigateTo('postDetail', post.id)} onUserClick={() => {}} />)}
          {posts.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#ccc" }}>暂无动态</div>}
        </div>
      </div>
    </div>
  );
};

const PostCard: React.FC<{ 
  post: PostType, 
  onLike: () => void, 
  onClick: () => void, 
  onUserClick: () => void,
  onEdit?: () => void,
  onDelete?: () => void 
}> = ({ post, onLike, onClick, onUserClick, onEdit, onDelete }) => {
  const [liked, setLiked] = useState(post.is_liked);
  const [likes, setLikes] = useState(post.likes_count);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikes(prev => prev + (liked ? -1 : 1));
    onLike();
  };

  const imageCount = post.images?.length || 0;
  let gridColumns = "repeat(3, 1fr)";
  if (imageCount === 1) gridColumns = "1fr";
  else if (imageCount === 4) gridColumns = "repeat(2, 1fr)";

  return (
    <div style={{ backgroundColor: "white", padding: 15, marginBottom: 8, cursor: "pointer" }} onClick={onClick}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <img 
          src={normalizeUrl(post.author?.avatar) || `https://ui-avatars.com/api/?name=${post.author?.username || 'user'}`} 
          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} 
          crossOrigin="anonymous"
          onClick={(e) => { e.stopPropagation(); onUserClick(); }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, fontSize: 15 }} onClick={(e) => { e.stopPropagation(); onUserClick(); }}>{post.author?.nickname || post.author?.username || '用户'}</span>
            <span style={{ fontSize: 11, color: COLORS.primary, backgroundColor: "rgba(52, 152, 219, 0.1)", padding: "2px 8px", borderRadius: 10 }}>{post.category}</span>
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSub }}>{formatTimeAgo(post.createdAt)}</div>
        </div>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-wrap", color: COLORS.textMain }}>{post.content}</div>
      
      {imageCount > 0 && (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: gridColumns, 
          gap: 6, 
          marginBottom: 12,
          maxWidth: imageCount === 1 ? "80%" : "100%"
        }}>
          {post.images.map((imgUrl, i) => (
            <img 
              key={i} 
              src={normalizeUrl(imgUrl)} 
              style={{ 
                width: "100%", 
                height: imageCount === 1 ? "auto" : "unset",
                aspectRatio: imageCount === 1 ? "unset" : "1 / 1",
                maxHeight: imageCount === 1 ? 400 : "unset",
                objectFit: "cover", 
                borderRadius: 8 
              }} 
              crossOrigin="anonymous"
            />
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid ${COLORS.border}`, gap: 10 }}>
        <ActionBtn icon={<Heart size={18} fill={liked ? COLORS.danger : "none"} color={liked ? COLORS.danger : COLORS.textSub} />} label={likes || '赞'} onClick={handleLike} active={liked} />
        <ActionBtn icon={<MessageCircle size={18} color={COLORS.textSub} />} label={post.comments_count || '评论'} />
        <ActionBtn icon={<Share2 size={18} color={COLORS.textSub} />} label="分享" />
      </div>
    </div>
  );
};

const PostModal = ({ editPost, onClose, onPosted }: { editPost?: PostType, onClose: () => void, onPosted: () => void }) => {
  const [content, setContent] = useState(editPost?.content || "");
  const [category, setCategory] = useState(editPost?.category || "生活");
  const [imagePaths, setImagePaths] = useState<string[]>(editPost?.images || []);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await api.uploadFile(file);
      setImagePaths(prev => [...prev, path]);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setPosting(true);
    try {
      await api.createPost(content, category, imagePaths);
      onPosted();
      onClose();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "white", zIndex: 1000, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.border}` }}>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 16, color: COLORS.textSub }}>取消</button>
        <span style={{ fontWeight: 600 }}>发布动态</span>
        <button onClick={handlePost} disabled={!content.trim() || posting || uploading} style={{ backgroundColor: COLORS.primary, color: "white", border: "none", padding: "6px 18px", borderRadius: 20, fontWeight: 600, opacity: (!content.trim() || posting || uploading) ? 0.5 : 1 }}>
          发布
        </button>
      </div>
      <div style={{ padding: 15, flex: 1, overflowY: "auto" }}>
        <div style={{ marginBottom: 15, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <div key={c.value} onClick={() => setCategory(c.value)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, backgroundColor: category === c.value ? COLORS.primary : "#f1f2f6", color: category === c.value ? "white" : COLORS.textSub }}>{c.label}</div>
          ))}
        </div>
        <textarea autoFocus placeholder="分享新鲜事..." value={content} onChange={e => setContent(e.target.value)} style={{ width: "100%", height: 150, border: "none", outline: "none", fontSize: 16, resize: "none" }} />
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 20 }}>
          {imagePaths.map((path, i) => (
            <div key={i} style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
              <img 
                src={normalizeUrl(path)} 
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} 
                crossOrigin="anonymous"
              />
              <div onClick={() => {
                const newPaths = [...imagePaths];
                newPaths.splice(i, 1);
                setImagePaths(newPaths);
              }} style={{ position: "absolute", top: -5, right: -5, backgroundColor: "rgba(0,0,0,0.6)", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={12}/></div>
            </div>
          ))}
          {imagePaths.length < 9 && (
            <div onClick={() => !uploading && fileRef.current?.click()} style={{ width: "100%", paddingBottom: "100%", backgroundColor: "#f9fafb", borderRadius: 8, position: "relative", border: `1px dashed ${COLORS.border}`, cursor: "pointer" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {uploading ? <Loader2 className="animate-spin" size={24} color={COLORS.primary} /> : <Plus size={32} color="#ccc" />}
              </div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
      </div>
    </div>
  );
};

const EditProfileView = ({ currentUser, onBack, onUpdate }: { currentUser: UserType | null, onBack: () => void, onUpdate: (user: UserType) => void }) => {
  const [nickname, setNickname] = useState(currentUser?.nickname || currentUser?.username || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await api.uploadFile(file);
      setAvatar(path);
    } catch (e: any) {
      alert(e.message || "上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) return alert("昵称不能为空");
    setSaving(true);
    try {
      const updates: any = { nickname, bio, avatar };
      if (password.trim()) updates.password = password;
      const updatedUser = await api.updateProfile(updates);
      onUpdate(updatedUser);
    } catch (e: any) {
      alert(e.message || "更新失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ height: "100%", backgroundColor: "white", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <ArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
            <span style={{ fontWeight: 600 }}>编辑资料</span>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ backgroundColor: COLORS.primary, color: "white", border: "none", padding: "6px 18px", borderRadius: 20, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
          {saving ? <Loader2 className="animate-spin" size={16} /> : "保存"}
        </button>
      </div>
      <div style={{ padding: 20, overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
            <div style={{ position: "relative", width: 100, height: 100, marginBottom: 10 }}>
                <img 
                    src={normalizeUrl(avatar) || `https://ui-avatars.com/api/?name=${nickname || 'user'}`} 
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: `1px solid ${COLORS.border}` }} 
                    crossOrigin="anonymous"
                />
                <div onClick={() => fileRef.current?.click()} style={{ position: "absolute", bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid white" }}>
                    {uploading ? <Loader2 className="animate-spin" size={16} color="white" /> : <Edit size={16} color="white" />}
                </div>
            </div>
            <span style={{ fontSize: 13, color: COLORS.textSub }}>点击修改头像</span>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMain }}>昵称</label>
                <input value={nickname} onChange={e => setNickname(e.target.value)} style={{ padding: "12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: 15, outline: "none" }} placeholder="请输入昵称" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMain }}>个人简介</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} style={{ padding: "12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: 15, outline: "none", height: 100, resize: "none" }} placeholder="介绍一下自己..." />
            </div>
             <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: COLORS.textMain }}>新密码 (选填)</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.bg, fontSize: 15, outline: "none" }} placeholder="不修改请留空" />
            </div>
        </div>
      </div>
    </div>
  );
};

const FollowListView = ({ type, userId, onBack, navigateTo }: { type: 'followers' | 'following', userId: number, onBack: () => void, navigateTo: (v: string, d?: any) => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let list = [];
        if (type === 'followers') {
          list = await api.getFollowers(userId);
          list = list.map((item: any) => item.follower);
        } else {
          list = await api.getFollowing(userId);
          list = list.map((item: any) => item.following);
        }
        setUsers(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, type]);

  return (
    <div style={{ height: "100%", backgroundColor: COLORS.bg, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 15, backgroundColor: "white" }}>
        <ArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
        <span style={{ fontWeight: 600 }}>{type === 'followers' ? '粉丝' : '关注'}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" size={24} color={COLORS.primary} /></div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: COLORS.textSub }}>暂无列表</div>
        ) : (
          users.map(user => (
            <div 
              key={user.id} 
              onClick={() => navigateTo('userDetail', user.id)}
              style={{ padding: "15px", backgroundColor: "white", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            >
              <img 
                src={normalizeUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.username}`} 
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} 
                crossOrigin="anonymous" 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{user.nickname || user.username}</div>
                <div style={{ fontSize: 12, color: COLORS.textSub }}>{user.bio || '暂无简介'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProfileView = ({ user, onLogout, navigateTo }: { user: UserType, onLogout: () => void, navigateTo: (v: string, d?: any) => void }) => {
  return (
    <div style={{ height: "100%", overflowY: "auto", paddingBottom: 60, backgroundColor: COLORS.bg }}>
      <div style={{ height: 180, background: `linear-gradient(135deg, ${COLORS.primary} 0%, #2980b9 100%)`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 20px 40px' }}>
        <div style={{ position: 'absolute', top: 15, right: 15 }}><Settings color="white" size={24} style={{ cursor: 'pointer' }} /></div>
      </div>
      <div style={{ backgroundColor: "white", margin: "-30px 15px 0", borderRadius: 16, padding: "0 20px 20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <img src={normalizeUrl(user.avatar) || `https://ui-avatars.com/api/?name=${user.username}`} style={{ width: 80, height: 80, borderRadius: "50%", border: `4px solid white`, marginTop: -40, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", objectFit: 'cover' }} crossOrigin="anonymous" />
          <div style={{ marginTop: 10 }}><button onClick={() => navigateTo('editProfile')} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${COLORS.border}`, backgroundColor: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>编辑资料</button></div>
        </div>
        <div style={{ marginTop: 15 }}>
          <h2 style={{ fontSize: 20, margin: "0 0 4px 0", color: COLORS.textMain }}>{user.nickname || user.username}</h2>
          <div style={{ fontSize: 12, color: COLORS.textSub }}>ID: {user.id}</div>
          <p style={{ fontSize: 14, color: COLORS.textSub, margin: "10px 0 20px", lineHeight: 1.5 }}>{user.bio || "添加你的个人简介，让邻居们更了解你吧 ~"}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${COLORS.border}`, paddingTop: 20 }}>
          <StatItem label="动态" count={user.posts_count || 0} />
          <StatItem label="获赞" count={0} />
          <StatItem label="粉丝" count={user.followers_count || 0} onClick={() => navigateTo('followList', { type: 'followers', userId: user.id })} />
          <StatItem label="关注" count={user.following_count || 0} onClick={() => navigateTo('followList', { type: 'following', userId: user.id })} />
        </div>
      </div>
      <div style={{ margin: "20px 15px", backgroundColor: "white", borderRadius: 16, overflow: 'hidden' }}>
        <MenuItem icon={<FileText size={20} color={COLORS.primary} />} label="我的动态" />
        <MenuItem icon={<Heart size={20} color={COLORS.danger} />} label="我的点赞" />
        <MenuItem icon={<Star size={20} color="#f1c40f" />} label="我的收藏" />
        <MenuItem icon={<Bell size={20} color={COLORS.primary} />} label="消息通知" />
        <MenuItem icon={<Settings size={20} color="#7f8c8d" />} label="账户设置" />
      </div>
      <div style={{ padding: "20px 15px 40px" }}>
        <button onClick={onLogout} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', backgroundColor: '#fff', color: COLORS.danger, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}><LogOut size={20} /> 退出登录</button>
      </div>
    </div>
  );
};

const TabItem = ({ icon, label, active, onClick }: any) => (
  <div onClick={onClick} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", color: active ? COLORS.primary : COLORS.textSub }}>
    {icon} <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
  </div>
);

const ActionBtn = ({ icon, label, onClick, active }: any) => (
  <div onClick={onClick} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: active ? COLORS.danger : COLORS.textSub, cursor: "pointer" }}>
    {icon} <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{label}</span>
  </div>
);

const StatItem = ({ label, count, onClick }: any) => (
  <div style={{ textAlign: 'center', flex: 1, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.textMain }}>{count}</div>
    <div style={{ fontSize: 12, color: COLORS.textSub, marginTop: 2 }}>{label}</div>
  </div>
);

const MenuItem = ({ icon, label, onClick }: any) => (
  <div onClick={onClick} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <span style={{ flex: 1, fontSize: 15, color: COLORS.textMain }}>{label}</span>
    <ChevronRight size={18} color="#ccc" />
  </div>
);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
