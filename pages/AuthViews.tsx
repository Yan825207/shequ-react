
import React, { useState } from 'react';
import { Users, Mail, Lock, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { UserInfo } from '../types';
import { COLORS } from '../constants';

export const LoginView = ({ onLoginSuccess, onGoRegister }: { onLoginSuccess: (user: UserInfo) => void, onGoRegister: () => void }) => {
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
      const msg = e?.message || (typeof e === 'string' ? e : JSON.stringify(e)) || "登录失败";
      setError(msg.replace(/^"|"$/g, '')); // Remove quotes if stringified simple string
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
        {error && <div style={{ color: COLORS.danger, fontSize: 13, textAlign: 'center' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ marginTop: 10, padding: 14, borderRadius: 12, border: "none", backgroundColor: COLORS.primary, color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}>
          {loading ? <Loader2 className="animate-spin" /> : "登 录"}
        </button>
      </form>
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ color: COLORS.textSub, fontSize: 14 }}>还没有账号？</span>
        <span onClick={onGoRegister} style={{ color: COLORS.primary, fontWeight: 600, cursor: "pointer", marginLeft: 5, fontSize: 14 }}>立即注册</span>
      </div>
    </div>
  );
};

export const RegisterView = ({ onRegisterSuccess, onGoLogin }: { onRegisterSuccess: () => void, onGoLogin: () => void }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", nickname: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.register(formData);
      onRegisterSuccess();
    } catch (e: any) {
      const msg = e?.message || (typeof e === 'string' ? e : JSON.stringify(e)) || "注册失败";
      setError(msg.replace(/^"|"$/g, ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 40px", backgroundColor: "white" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.textMain }}>创建账号</h1>
        <p style={{ color: COLORS.textSub, fontSize: 14 }}>加入我们，分享您的生活</p>
      </div>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input type="text" placeholder="用户名" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${COLORS.border}`, outline: "none", backgroundColor: "#f9fafb" }} />
        <input type="email" placeholder="邮箱" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${COLORS.border}`, outline: "none", backgroundColor: "#f9fafb" }} />
        <input type="password" placeholder="密码" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${COLORS.border}`, outline: "none", backgroundColor: "#f9fafb" }} />
        <input type="text" placeholder="昵称 (可选)" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} style={{ width: "100%", padding: "14px", borderRadius: 12, border: `1px solid ${COLORS.border}`, outline: "none", backgroundColor: "#f9fafb" }} />
        {error && <div style={{ color: COLORS.danger, fontSize: 13, textAlign: 'center' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ marginTop: 10, padding: 14, borderRadius: 12, border: "none", backgroundColor: COLORS.primary, color: "white", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
          {loading ? <Loader2 className="animate-spin" style={{margin:"0 auto"}} /> : "注 册"}
        </button>
      </form>
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <span style={{ color: COLORS.textSub, fontSize: 14 }}>已有账号？</span>
        <span onClick={onGoLogin} style={{ color: COLORS.primary, fontWeight: 600, cursor: "pointer", marginLeft: 5, fontSize: 14 }}>去登录</span>
      </div>
    </div>
  );
};
