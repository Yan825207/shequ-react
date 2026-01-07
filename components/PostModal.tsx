
import React, { useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { normalizeUrl } from '../utils/format';
import { toast } from '../utils/request';
import { COLORS, CATEGORIES } from '../constants';

export const PostModal = ({ editPost, onClose, onPosted }: any) => {
    const [content, setContent] = useState(editPost?.content || "");
    const [category, setCategory] = useState(editPost?.category || "生活");
    const [images, setImages] = useState<string[]>(editPost?.images || []);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async () => {
        if (!content) return;
        setLoading(true);
        try {
            await api.createPost(content, category, images);
            onPosted();
            onClose();
        } catch(e) { console.error(e); } finally { setLoading(false); }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            try {
                const files = Array.from(e.target.files);
                const urls = await api.uploadFiles(files);
                setImages(prev => [...prev, ...urls]);
            } catch (e) {
                toast.show({ title: '图片上传失败', icon: 'none' });
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "white", zIndex: 200, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.border}` }}>
                <span onClick={onClose} style={{ cursor: "pointer" }}>取消</span>
                <span style={{ fontWeight: 600 }}>发布动态</span>
                <button onClick={handleSubmit} disabled={loading || uploading} style={{ backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: 15, padding: "5px 15px", fontWeight: 600, opacity: (loading || uploading) ? 0.7 : 1 }}>发布</button>
            </div>
            <div style={{ padding: 20, flex: 1 }}>
                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="分享你的新鲜事..." style={{ width: "100%", height: 150, border: "none", outline: "none", fontSize: 16, resize: "none" }} />
                <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                    {CATEGORIES.map(c => (
                        <div key={c.value} onClick={() => setCategory(c.value)} style={{ padding: "5px 12px", borderRadius: 15, backgroundColor: category === c.value ? COLORS.primary : "#f0f2f5", color: category === c.value ? "white" : COLORS.textSub, fontSize: 13, cursor: "pointer" }}>{c.label}</div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {images.map((url, i) => (
                        <div key={i} style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                            <img src={normalizeUrl(url)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            <div onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={{ position: "absolute", top: 2, right: 2, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "50%", padding: 2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <X size={12} color="white" />
                            </div>
                        </div>
                    ))}
                    {uploading && <div style={{ width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f2f5", borderRadius: 8, flexShrink: 0 }}><Loader2 className="animate-spin" /></div>}
                    <label style={{ width: 80, height: 80, backgroundColor: "#f0f2f5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                        <Camera size={24} color={COLORS.textSub} />
                        <input type="file" multiple hidden accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
            </div>
        </div>
    );
};
