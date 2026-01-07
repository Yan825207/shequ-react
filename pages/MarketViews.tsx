
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Briefcase, Calendar, Heart, ArrowLeft, Loader2, ChevronRight, X, Camera } from 'lucide-react';
import { api } from '../services/api';
import { ProductType, CommentType } from '../types';
import { normalizeUrl, formatTimeAgo } from '../utils/format';
import { toast } from '../utils/request';
import { COLORS } from '../constants';

export const DiscoveryView = ({ navigateTo }: { navigateTo: any }) => {
  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>发现</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
        <div onClick={() => navigateTo('productList')} style={{ backgroundColor: "#e3f2fd", padding: 20, borderRadius: 16, cursor: "pointer" }}>
          <ShoppingBag color="#2196f3" size={32} style={{ marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>闲置交易</div>
          <div style={{ fontSize: 12, color: "#1976d2", marginTop: 5 }}>邻里二手好物</div>
        </div>
        <div style={{ backgroundColor: "#e8f5e9", padding: 20, borderRadius: 16 }}>
          <Briefcase color="#4caf50" size={32} style={{ marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>求职招聘</div>
          <div style={{ fontSize: 12, color: "#388e3c", marginTop: 5 }}>家门口的工作</div>
        </div>
        <div style={{ backgroundColor: "#fff3e0", padding: 20, borderRadius: 16 }}>
          <Calendar color="#ff9800" size={32} style={{ marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>社区活动</div>
          <div style={{ fontSize: 12, color: "#f57c00", marginTop: 5 }}>一起玩耍吧</div>
        </div>
        <div style={{ backgroundColor: "#f3e5f5", padding: 20, borderRadius: 16 }}>
          <Heart color="#9c27b0" size={32} style={{ marginBottom: 10 }} />
          <div style={{ fontWeight: 700, fontSize: 16 }}>公益互助</div>
          <div style={{ fontSize: 12, color: "#7b1fa2", marginTop: 5 }}>爱心传递</div>
        </div>
      </div>
    </div>
  );
};

export const ProductListView = ({ navigateTo, onBack }: { navigateTo: any, onBack: () => void }) => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({ page: 1, pageSize: 20 });
      setProducts(res.list);
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
       <div style={{ padding: "10px 15px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${COLORS.border}` }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <ArrowLeft onClick={onBack} style={{ cursor: "pointer", marginRight: 10 }} />
            <span style={{ fontSize: 18, fontWeight: 700 }}>闲置市场</span>
          </div>
          <button onClick={() => navigateTo('createProduct')} style={{ padding: "6px 12px", backgroundColor: COLORS.secondary, color: "white", border: "none", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>发布闲置</button>
       </div>
       <div style={{ flex: 1, overflowY: "auto", padding: 10, background: COLORS.bg }}>
          {loading ? <Loader2 className="animate-spin" style={{margin:"20px auto"}} /> : (
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {products.map(p => (
                   <div key={p.id} onClick={() => navigateTo('productDetail', p.id)} style={{ backgroundColor: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                      <img src={normalizeUrl(p.images[0] || "")} style={{ width: "100%", height: 160, objectFit: "cover", backgroundColor: "#eee" }} />
                      <div style={{ padding: 10 }}>
                         <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</div>
                         <div style={{ color: COLORS.danger, fontWeight: 700, fontSize: 15 }}>¥{p.price}</div>
                         <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
                            <img src={p.author.avatar || "https://via.placeholder.com/20"} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 5 }} />
                            <span style={{ fontSize: 11, color: COLORS.textSub, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.author.nickname}</span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};

export const ProductDetailView = ({ id, onBack, navigateTo, currentUser }: { id: number, onBack: () => void, navigateTo: any, currentUser: any }) => {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<CommentType | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        api.getProductDetail(id),
        api.getProductComments(id)
      ]);
      setProduct(p);
      setComments(c);
    } catch (e) {
      console.error(e);
      toast.show({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    if (!currentUser) {
        toast.show({ title: '请先登录', icon: 'none' });
        return;
    }
    
    try {
        await api.createComment({
            productId: id,
            content: commentText,
            parentCommentId: replyTo?.id || null
        });
        
        toast.show({ title: '留言成功', icon: 'success' });
        setCommentText("");
        setReplyTo(null);
        
        // Refresh comments
        const c = await api.getProductComments(id);
        setComments(c);
    } catch(e) {
        console.error(e);
        toast.show({ title: '留言失败', icon: 'none' });
    }
  };

  if (loading || !product) {
    return <div style={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}><Loader2 className="animate-spin" /></div>;
  }

  const renderComment = (comment: CommentType, isReply = false) => (
    <div key={comment.id} style={{ display: "flex", gap: 10, marginBottom: 16, paddingLeft: isReply ? 40 : 0 }}>
        <img src={normalizeUrl(comment.avatar || "") || "https://via.placeholder.com/32"} style={{ width: 32, height: 32, borderRadius: "50%" }} />
        <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSub }}>{comment.nickname}</span>
                <span style={{ fontSize: 12, color: "#999" }}>{formatTimeAgo(comment.created_at || comment.createdAt)}</span>
            </div>
            <div style={{ fontSize: 14, marginTop: 4, color: COLORS.textMain }}>{comment.content}</div>
            <div style={{ marginTop: 4, display: "flex", gap: 15 }}>
                <span onClick={() => setReplyTo(comment)} style={{ fontSize: 12, color: COLORS.primary, cursor: "pointer" }}>回复</span>
            </div>
            {comment.replies && comment.replies.map(r => renderComment(r, true))}
        </div>
    </div>
  );

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", backgroundColor: "white" }}>
      <div style={{ padding: "10px 15px", display: "flex", alignItems: "center", borderBottom: `1px solid ${COLORS.border}` }}>
        <ArrowLeft onClick={onBack} style={{ cursor: "pointer" }} />
        <span style={{ marginLeft: 15, fontWeight: 600, fontSize: 17 }}>商品详情</span>
      </div>
      
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        {/* Images */}
        {product.images.length > 0 ? (
          <div style={{ overflowX: "auto", display: "flex", scrollSnapType: "x mandatory", height: 300 }}>
             {product.images.map((img, i) => (
               <img key={i} src={normalizeUrl(img)} style={{ minWidth: "100%", height: "100%", objectFit: "cover", scrollSnapAlign: "start" }} />
             ))}
          </div>
        ) : (
          <div style={{ height: 200, backgroundColor: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>暂无图片</div>
        )}

        <div style={{ padding: 20 }}>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ color: COLORS.danger, fontSize: 24, fontWeight: 800 }}>¥{product.price}</span>
              <span style={{ fontSize: 12, color: COLORS.textSub }}>{product.views}浏览</span>
           </div>
           <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, lineHeight: 1.4 }}>{product.title}</h1>
           <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
              <span style={{ backgroundColor: "#f0f9ff", color: COLORS.primary, padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{product.category}</span>
              <span style={{ backgroundColor: product.isSold ? "#fee2e2" : "#dcfce7", color: product.isSold ? COLORS.danger : COLORS.secondary, padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>{product.isSold ? '已售出' : '在售'}</span>
           </div>
           <p style={{ fontSize: 15, color: "#444", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{product.description}</p>
        </div>

        <div style={{ padding: "0 20px", marginTop: 10 }}>
           <div onClick={() => navigateTo('userDetail', product.authorId)} style={{ display: "flex", alignItems: "center", padding: "15px", backgroundColor: COLORS.bg, borderRadius: 12, cursor: "pointer" }}>
              <img src={product.author.avatar || "https://via.placeholder.com/40"} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
              <div style={{ flex: 1 }}>
                 <div style={{ fontWeight: 600 }}>{product.author.nickname || "未知用户"}</div>
                 <div style={{ fontSize: 12, color: COLORS.textSub }}>发布于 {formatTimeAgo(product.createdAt)}</div>
              </div>
              <ChevronRight size={18} color={COLORS.textSub} />
           </div>
        </div>

        {/* Comments Section */}
        <div style={{ padding: 20, marginTop: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>留言 ({comments.length})</h3>
            <div>
                {comments.map(c => renderComment(c))}
                {comments.length === 0 && <div style={{ color: "#999", textAlign: "center", padding: 20 }}>暂无留言，快来问问吧~</div>}
            </div>
        </div>
      </div>

      <div style={{ padding: "10px 15px", borderTop: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 10, backgroundColor: "white" }}>
         {replyTo && (
             <div style={{ position: "absolute", bottom: 60, left: 15, right: 15, backgroundColor: "#333", color: "white", padding: "8px 15px", borderRadius: 8, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                 <span>回复 @{replyTo.nickname}</span>
                 <X size={14} onClick={() => setReplyTo(null)} style={{ cursor: "pointer" }} />
             </div>
         )}
         <input 
            value={commentText} 
            onChange={e => setCommentText(e.target.value)} 
            placeholder={replyTo ? `回复 ${replyTo.nickname}...` : "看对眼了？问问细节~"} 
            style={{ flex: 1, padding: "10px 15px", borderRadius: 20, border: "none", backgroundColor: COLORS.bg, outline: "none", fontSize: 14 }} 
         />
         <button onClick={handleSubmitComment} disabled={!commentText.trim()} style={{ backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: 20, padding: "8px 16px", fontWeight: 600, opacity: commentText.trim() ? 1 : 0.5 }}>发送</button>
      </div>
    </div>
  );
};

export const CreateProductView = ({ onBack, onCreated }: { onBack: () => void, onCreated: () => void }) => {
  const [formData, setFormData] = useState({ title: "", description: "", price: "", category: "闲置" });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
     if (!formData.title.trim()) {
        toast.show({ title: '请输入标题', icon: 'none' });
        return;
     }
     if (!formData.description.trim()) {
        toast.show({ title: '请输入详细描述', icon: 'none' });
        return;
     }
     if (!formData.price) {
        toast.show({ title: '请输入价格', icon: 'none' });
        return;
     }
     if (images.length === 0) {
        toast.show({ title: '请上传至少一张图片', icon: 'none' });
        return;
     }

     setLoading(true);
     try {
        await api.createProduct({
            ...formData,
            price: Number(formData.price),
            images: images
        });
        toast.show({ title: '发布成功', icon: 'success' });
        setTimeout(() => {
            onCreated();
        }, 1000);
     } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      if(input.files && input.files.length > 0) {
          setUploading(true);
          const uni = (window as any).uni;
          if(uni && uni.showLoading) uni.showLoading({ title: '上传中...' });

          try {
              const files = Array.from(input.files);
              const urls = await api.uploadFiles(files);
              if (urls && urls.length > 0) {
                  setImages(prev => [...prev, ...urls]);
              } else {
                  toast.show({title: '上传未能返回图片地址', icon: 'none'});
              }
          } catch(e) {
              toast.show({title: '图片上传失败', icon: 'error'});
          } finally {
              setUploading(false);
              if(uni && uni.hideLoading) uni.hideLoading();
              // Reset input value to allow re-selection of the same file if needed
              input.value = '';
          }
      }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "white" }}>
       <div style={{ padding: "10px 15px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
             <ArrowLeft onClick={onBack} style={{ cursor: "pointer", marginRight: 10 }} />
             <span style={{ fontWeight: 600 }}>发布闲置</span>
          </div>
          <button onClick={handleSubmit} disabled={loading || uploading} style={{ backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: 4, padding: "6px 12px", opacity: (loading || uploading) ? 0.7 : 1 }}>发布</button>
       </div>
       <div style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, overflowX: "auto" }}>
             {images.map((url, i) => (
                 <div key={i} style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                     <img src={normalizeUrl(url)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                     <div onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: 2, right: 2, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "50%", padding: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12} color="white" />
                     </div>
                 </div>
             ))}
             {uploading && <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f2f5", borderRadius: 8, flexShrink: 0 }}><Loader2 className="animate-spin" /></div>}
             <label style={{ width: 80, height: 80, border: `1px dashed ${COLORS.border}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                 <Camera size={24} color={COLORS.textSub} />
                 <input type="file" multiple hidden accept="image/*" onChange={handleImageChange} disabled={uploading} />
             </label>
          </div>
          <input placeholder="标题 品牌型号..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: "100%", padding: "10px 0", fontSize: 16, border: "none", borderBottom: `1px solid ${COLORS.border}`, outline: "none", marginBottom: 15 }} />
          <textarea placeholder="描述一下宝贝的细节..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: "100%", height: 100, border: "none", resize: "none", outline: "none", fontSize: 15, marginBottom: 15 }} />
          <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 10 }}>
             <span style={{ fontSize: 15, width: 80 }}>价格</span>
             <span style={{ color: COLORS.danger, fontWeight: 700, marginRight: 5 }}>¥</span>
             <input type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ flex: 1, border: "none", outline: "none", fontSize: 16 }} />
          </div>
       </div>
    </div>
  );
};
