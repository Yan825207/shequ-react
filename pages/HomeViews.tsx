
import React, { useState, useEffect } from 'react';
import { Bell, Loader2, Heart, MessageCircle, Share2, ArrowLeft, Send } from 'lucide-react';
import { api } from '../services/api';
import { PostType, CommentType, UserInfo } from '../types';
import { normalizeUrl, formatTimeAgo } from '../utils/format';
import { COLORS } from '../constants';

export const HomeView = ({ currentUser, navigateTo }: { currentUser: UserInfo | null, navigateTo: any }) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.getPosts(1);
      setPosts(res.list);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPosts();
    const handleRefresh = () => fetchPosts();
    window.addEventListener('refresh', handleRefresh);
    return () => window.removeEventListener('refresh', handleRefresh);
  }, []);

  return (
    <div style={{ height: "100%", overflowY: "auto", paddingBottom: 60 }}>
       <div style={{ padding: "15px 20px", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
         <h2 style={{ fontSize: 20, fontWeight: 800 }}>社区动态</h2>
         <Bell size={20} color={COLORS.textMain} />
       </div>
       <div style={{ padding: 10 }}>
         {loading ? (
            <div style={{ padding: 20, textAlign: "center" }}><Loader2 className="animate-spin" style={{margin:"0 auto"}} /></div>
         ) : (
            posts.map(post => (
              <div key={post.id} onClick={() => navigateTo('postDetail', post.id)} style={{ backgroundColor: "white", borderRadius: 12, padding: 15, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                 <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                    <img src={post.author.avatar || "https://via.placeholder.com/40"} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, objectFit: "cover" }} />
                    <div style={{ flex: 1 }}>
                       <div style={{ fontWeight: 600, fontSize: 15 }}>{post.author.nickname || post.author.username}</div>
                       <div style={{ fontSize: 12, color: COLORS.textSub }}>{formatTimeAgo(post.createdAt)}</div>
                    </div>
                    <div style={{ padding: "2px 8px", backgroundColor: "#f0f2f5", borderRadius: 4, fontSize: 11, color: COLORS.textSub }}>{post.category}</div>
                 </div>
                 <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{post.title}</h3>
                 <p style={{ fontSize: 14, color: COLORS.textMain, lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.content}</p>
                 {post.images && post.images.length > 0 && (
                   <div style={{ display: "grid", gridTemplateColumns: post.images.length === 1 ? "1fr" : "1fr 1fr", gap: 5, marginBottom: 10 }}>
                     {post.images.slice(0, 2).map((img, i) => (
                       <img key={i} src={normalizeUrl(img)} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }} />
                     ))}
                   </div>
                 )}
                 <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.textSub, fontSize: 13 }}><Heart size={16} /> {post.likes_count}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.textSub, fontSize: 13 }}><MessageCircle size={16} /> {post.comments_count}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, color: COLORS.textSub, fontSize: 13 }}><Share2 size={16} /> 分享</div>
                 </div>
              </div>
            ))
         )}
       </div>
    </div>
  );
};

export const PostDetailView = ({ id, onBack, navigateTo }: { id: number, onBack: () => void, navigateTo: any }) => {
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.getPostDetail(id), api.getComments(id)]);
      setPost(p);
      setComments(c);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleLike = async () => {
    if(!post) return;
    const newLiked = !post.is_liked;
    setPost({ ...post, is_liked: newLiked, likes_count: post.likes_count + (newLiked ? 1 : -1) });
    await api.likePost(post.id, post.is_liked);
  };

  const handleSendComment = async () => {
    if(!commentText.trim() || !post) return;
    await api.postComment(post.id, commentText);
    setCommentText("");
    const c = await api.getComments(post.id);
    setComments(c);
  };

  if (loading || !post) return <div style={{ padding: 20, textAlign: "center" }}><Loader2 className="animate-spin" style={{margin:"0 auto"}} /></div>;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", padding: "0 15px", borderBottom: `1px solid ${COLORS.border}` }}>
        <ArrowLeft onClick={onBack} style={{ cursor: "pointer", marginRight: 10 }} />
        <span style={{ fontWeight: 600 }}>动态详情</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 15 }}>
         <div style={{ display: "flex", alignItems: "center", marginBottom: 15 }}>
            <img onClick={() => navigateTo('userDetail', post.author.id)} src={post.author.avatar || "https://via.placeholder.com/40"} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10, cursor: "pointer" }} />
            <div>
               <div style={{ fontWeight: 600 }}>{post.author.nickname || post.author.username}</div>
               <div style={{ fontSize: 12, color: COLORS.textSub }}>{formatTimeAgo(post.createdAt)}</div>
            </div>
         </div>
         <h2 style={{ fontSize: 18, marginBottom: 10 }}>{post.title}</h2>
         <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 15 }}>{post.content}</p>
         {post.images.map((img, i) => (
           <img key={i} src={normalizeUrl(img)} style={{ width: "100%", borderRadius: 8, marginBottom: 10 }} />
         ))}
         
         <div style={{ marginTop: 20, paddingTop: 15, borderTop: `1px solid ${COLORS.border}` }}>
           <h3 style={{ fontSize: 16, marginBottom: 15 }}>评论 ({comments.length})</h3>
           {comments.map(c => (
             <div key={c.id} style={{ display: "flex", marginBottom: 15 }}>
               <img src={normalizeUrl(c.avatar || "")} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
               <div style={{ flex: 1 }}>
                 <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSub }}>{c.nickname} <span style={{ fontWeight: 400, marginLeft: 5, fontSize: 12 }}>{formatTimeAgo(c.created_at || c.createdAt)}</span></div>
                 <div style={{ fontSize: 14, marginTop: 4 }}>{c.content}</div>
               </div>
             </div>
           ))}
         </div>
      </div>
      <div style={{ padding: "10px 15px", borderTop: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
        <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="写评论..." style={{ flex: 1, padding: "10px 15px", borderRadius: 20, border: "none", backgroundColor: COLORS.bg, outline: "none" }} />
        <div onClick={handleLike} style={{ padding: 8, cursor: "pointer", color: post.is_liked ? COLORS.danger : COLORS.textSub }}><Heart fill={post.is_liked ? COLORS.danger : "none"} size={24} /></div>
        <div onClick={handleSendComment} style={{ padding: 8, cursor: "pointer", color: COLORS.primary }}><Send size={24} /></div>
      </div>
    </div>
  );
};
