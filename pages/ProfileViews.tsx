
import React, { useState, useEffect } from 'react';
import { Settings, LogOut, ShoppingBag, Heart, Bell, Lock, ArrowLeft, Loader2, Camera } from 'lucide-react';
import { api } from '../services/api';
import { UserInfo, PostType } from '../types';
import { normalizeUrl, formatTimeAgo } from '../utils/format';
import { toast } from '../utils/request';
import { COLORS } from '../constants';
import { MenuItem } from '../components/UiComponents';

export const ProfileView = ({ user, onLogout, navigateTo }: { user: UserInfo, onLogout: () => void, navigateTo: any }) => {
  return (
    <div style={{ height: "100%", overflowY: "auto", background: COLORS.bg }}>
       <div style={{ backgroundColor: "white", padding: "30px 20px 20px", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
             <img src={normalizeUrl(user.avatar || "") || "https://via.placeholder.com/80"} style={{ width: 80, height: 80, borderRadius: 40, marginRight: 20 }} />
             <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 5 }}>{user.nickname || user.username}</div>
                <div style={{ fontSize: 14, color: COLORS.textSub }}>ID: {user.id}</div>
             </div>
             <Settings size={24} color={COLORS.textMain} style={{ cursor: "pointer" }} onClick={() => navigateTo('editProfile')} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
             <div onClick={() => navigateTo('followList', { type: 'following', userId: user.id })} style={{ cursor: "pointer" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.following_count || 0}</div>
                <div style={{ fontSize: 12, color: COLORS.textSub }}>关注</div>
             </div>
             <div onClick={() => navigateTo('followList', { type: 'followers', userId: user.id })} style={{ cursor: "pointer" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.followers_count || 0}</div>
                <div style={{ fontSize: 12, color: COLORS.textSub }}>粉丝</div>
             </div>
             <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.posts_count || 0}</div>
                <div style={{ fontSize: 12, color: COLORS.textSub }}>动态</div>
             </div>
          </div>
       </div>
       
       <div style={{ backgroundColor: "white", padding: "0 20px" }}>
          <MenuItem icon={<ShoppingBag size={20} />} label="我发布的闲置" onClick={() => navigateTo('productList', { userId: user.id })} />
          <MenuItem icon={<Heart size={20} />} label="我的收藏" />
          <MenuItem icon={<Bell size={20} />} label="通知设置" />
          <MenuItem icon={<Lock size={20} />} label="修改密码" onClick={() => navigateTo('changePassword')} />
          <div onClick={onLogout} style={{ padding: "15px 0", display: "flex", alignItems: "center", color: COLORS.danger, cursor: "pointer" }}>
             <LogOut size={20} style={{ marginRight: 15 }} />
             <span>退出登录</span>
          </div>
       </div>
    </div>
  );
};

export const UserDetailView = ({ id, onBack, navigateTo, currentUser }: { id: number, onBack: () => void, navigateTo: any, currentUser: any }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, p, f] = await Promise.all([
          api.getUser(id),
          api.getPosts(1, id),
          api.checkFollowStatus(id)
        ]);
        setUser(u);
        setPosts(p.list);
        setIsFollowing(f);
      } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleFollow = async () => {
    if(!user) return;
    try {
      if(isFollowing) await api.unfollowUser(user.id);
      else await api.followUser(user.id);
      setIsFollowing(!isFollowing);
      // Refresh user info to update counts
      const u = await api.getUser(id);
      setUser(u);
    } catch(e) { console.error(e); }
  };

  if(loading || !user) return <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ height: "100%", overflowY: "auto", background: COLORS.bg }}>
       <div style={{ backgroundColor: "white", marginBottom: 10 }}>
          <div style={{ padding: "10px 15px", display: "flex", alignItems: "center" }}>
             <ArrowLeft onClick={onBack} style={{ cursor: "pointer", marginRight: 10 }} />
          </div>
          <div style={{ padding: "10px 20px 20px" }}>
             <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 20 }}>
                <img src={normalizeUrl(user.avatar) || "https://via.placeholder.com/80"} style={{ width: 80, height: 80, borderRadius: 40, marginRight: 20 }} />
                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 5 }}>{user.nickname || user.username}</div>
                   <div style={{ fontSize: 14, color: COLORS.textSub, marginBottom: 10 }}>{user.bio || "这个人很懒，什么都没写"}</div>
                   {currentUser?.id !== user.id && (
                     <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleFollow} style={{ flex: 1, padding: "6px 0", borderRadius: 20, border: isFollowing ? `1px solid ${COLORS.border}` : "none", backgroundColor: isFollowing ? "white" : COLORS.primary, color: isFollowing ? COLORS.textMain : "white", fontWeight: 600 }}>
                           {isFollowing ? "已关注" : "关注"}
                        </button>
                        <button onClick={() => navigateTo('chatDetail', user)} style={{ flex: 1, padding: "6px 0", borderRadius: 20, border: `1px solid ${COLORS.border}`, backgroundColor: "white", color: COLORS.textMain, fontWeight: 600 }}>私信</button>
                     </div>
                   )}
                </div>
             </div>
             <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
                <div onClick={() => navigateTo('followList', { type: 'following', userId: user.id })} style={{ cursor: "pointer" }}>
                   <div style={{ fontWeight: 700, fontSize: 18 }}>{user.following_count || 0}</div>
                   <div style={{ fontSize: 12, color: COLORS.textSub }}>关注</div>
                </div>
                <div onClick={() => navigateTo('followList', { type: 'followers', userId: user.id })} style={{ cursor: "pointer" }}>
                   <div style={{ fontWeight: 700, fontSize: 18 }}>{user.followers_count || 0}</div>
                   <div style={{ fontSize: 12, color: COLORS.textSub }}>粉丝</div>
                </div>
                <div>
                   <div style={{ fontWeight: 700, fontSize: 18 }}>{user.posts_count || 0}</div>
                   <div style={{ fontSize: 12, color: COLORS.textSub }}>动态</div>
                </div>
             </div>
          </div>
       </div>
       
       <div style={{ padding: "10px 15px", backgroundColor: "white", borderBottom: `1px solid ${COLORS.border}`, fontWeight: 700 }}>动态</div>
       <div>
          {posts.map(post => (
             <div key={post.id} onClick={() => navigateTo('postDetail', post.id)} style={{ backgroundColor: "white", padding: 15, borderBottom: `1px solid ${COLORS.border}` }}>
                <div style={{ fontSize: 14, color: COLORS.textSub, marginBottom: 5 }}>{formatTimeAgo(post.createdAt)}</div>
                <div style={{ fontSize: 16, marginBottom: 8 }}>{post.content}</div>
                {post.images && post.images.length > 0 && (
                   <div style={{ display: "flex", gap: 5 }}>
                      {post.images.slice(0, 3).map((img, i) => (
                         <img key={i} src={normalizeUrl(img)} style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }} />
                      ))}
                   </div>
                )}
             </div>
          ))}
       </div>
    </div>
  );
};

export const FollowListView = ({ type, userId, onBack, navigateTo }: { type: 'followers' | 'following', userId: number, onBack: () => void, navigateTo: any }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = type === 'followers' ? await api.getFollowers(userId) : await api.getFollowing(userId);
        setUsers(res);
      } catch(e) { console.error(e); } finally { setLoading(false); }
    };
    load();
  }, [type, userId]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
       <div style={{ padding: "10px 15px", display: "flex", alignItems: "center", borderBottom: `1px solid ${COLORS.border}` }}>
          <ArrowLeft onClick={onBack} style={{ cursor: "pointer", marginRight: 10 }} />
          <span style={{ fontWeight: 600 }}>{type === 'followers' ? '粉丝' : '关注'}</span>
       </div>
       <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? <div style={{ padding: 20, textAlign: "center" }}><Loader2 className="animate-spin" style={{margin:"0 auto"}} /></div> : (
             users.map(u => (
                <div key={u.id} onClick={() => navigateTo('userDetail', u.id)} style={{ display: "flex", alignItems: "center", padding: "15px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
                   <img src={normalizeUrl(u.avatar) || "https://via.placeholder.com/40"} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                   <div style={{ fontWeight: 600 }}>{u.nickname || u.username}</div>
                </div>
             ))
          )}
          {!loading && users.length === 0 && <div style={{ padding: 20, textAlign: "center", color: COLORS.textSub }}>暂无数据</div>}
       </div>
    </div>
  );
};

export const EditProfileView = ({ currentUser, onBack, onUpdate }: any) => {
    const [formData, setFormData] = useState({ 
        nickname: currentUser?.nickname || "", 
        bio: currentUser?.bio || "",
        avatar: currentUser?.avatar || ""
    });
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const updated = await api.updateProfile(formData);
            onUpdate(updated);
            toast.show({ title: '保存成功', icon: 'success' });
            setTimeout(() => onBack(), 1000);
        } catch(e) { 
            console.error(e); 
            toast.show({ title: '保存失败', icon: 'none' });
        } finally { 
            setLoading(false); 
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadingAvatar(true);
            const file = e.target.files[0];
            try {
                const url = await api.uploadFile(file);
                setFormData({ ...formData, avatar: url });
            } catch(e) {
                toast.show({ title: '头像上传失败', icon: 'none' });
            } finally {
                setUploadingAvatar(false);
            }
        }
    };

    return (
        <div style={{ background: "white", height: "100%" }}>
            <div style={{ padding: "10px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
               <div style={{ display: "flex", alignItems: "center" }}><ArrowLeft onClick={onBack} style={{ marginRight: 10, cursor: "pointer" }} /> 编辑资料</div>
               <button onClick={handleSave} disabled={loading || uploadingAvatar} style={{ border: "none", background: "none", color: COLORS.primary, fontWeight: 600, cursor: "pointer", opacity: (loading || uploadingAvatar) ? 0.5 : 1 }}>
                   {loading ? <Loader2 className="animate-spin" size={16} /> : "保存"}
               </button>
            </div>
            <div style={{ padding: 20 }}>
                {/* Avatar Section */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
                    <div style={{ position: "relative", width: 80, height: 80 }}>
                        <img 
                            src={normalizeUrl(formData.avatar) || "https://via.placeholder.com/80"} 
                            style={{ width: "100%", height: "100%", borderRadius: 40, objectFit: "cover", border: `1px solid ${COLORS.border}` }} 
                        />
                        {uploadingAvatar && (
                          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: 40, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Loader2 className="animate-spin" color="white" />
                          </div>
                        )}
                        <label style={{ 
                            position: "absolute", bottom: 0, right: 0, 
                            backgroundColor: COLORS.primary, borderRadius: "50%", 
                            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", border: "2px solid white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                            <Camera size={14} color="white" />
                            <input type="file" hidden accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                        </label>
                    </div>
                    <span style={{ fontSize: 12, color: COLORS.textSub, marginTop: 10 }}>点击修改头像</span>
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, color: COLORS.textSub, fontSize: 13, fontWeight: 500 }}>昵称</label>
                    <input value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} style={{ width: "100%", padding: "12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontSize: 15, outline: "none", backgroundColor: COLORS.bg }} />
                </div>
                <div>
                    <label style={{ display: "block", marginBottom: 8, color: COLORS.textSub, fontSize: 13, fontWeight: 500 }}>个人简介</label>
                    <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ width: "100%", padding: "12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, height: 120, fontSize: 15, outline: "none", resize: "none", backgroundColor: COLORS.bg }} />
                </div>
            </div>
        </div>
    );
};
