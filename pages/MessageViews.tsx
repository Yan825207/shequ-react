
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { MessageType, UserInfo } from '../types';
import { formatTimeAgo } from '../utils/format';
import { COLORS } from '../constants';

export const MessagesView = ({ navigateTo, currentUser }: { navigateTo: any, currentUser: UserInfo | null }) => {
  const [conversations, setConversations] = useState<MessageType[]>([]);

  useEffect(() => {
     api.getConversations().then(res => setConversations(res));
  }, []);

  return (
     <div style={{ padding: "10px 0" }}>
        <h2 style={{ padding: "0 20px", fontSize: 24, fontWeight: 800, marginBottom: 20 }}>消息</h2>
        {conversations.map(c => {
           const otherUser = c.senderId === currentUser?.id ? c.receiver : c.sender;
           return (
             <div key={c.id} onClick={() => navigateTo('chatDetail', otherUser)} style={{ display: "flex", padding: "15px 20px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", background: "white" }}>
                <img src={otherUser?.avatar || "https://via.placeholder.com/50"} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 15 }} />
                <div style={{ flex: 1 }}>
                   <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontWeight: 600 }}>{otherUser?.nickname || otherUser?.username}</span>
                      <span style={{ fontSize: 12, color: COLORS.textSub }}>{formatTimeAgo(c.createdAt)}</span>
                   </div>
                   <div style={{ fontSize: 14, color: COLORS.textSub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.content}</div>
                </div>
             </div>
           );
        })}
     </div>
  );
};

export const ChatDetailView = ({ user, currentUser, onBack }: { user: UserInfo, currentUser: UserInfo | null, onBack: () => void }) => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [text, setText] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const load = async () => {
        const msgs = await api.getChatMessages(user.id);
        setMessages(msgs);
        setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
    };

    useEffect(() => { load(); }, [user.id]);

    const handleSend = async () => {
        if(!text.trim()) return;
        await api.sendMessage(user.id, text);
        setText("");
        load();
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
            <div style={{ padding: "10px 15px", background: "white", display: "flex", alignItems: "center", borderBottom: `1px solid ${COLORS.border}` }}>
                <ArrowLeft onClick={onBack} style={{ cursor: "pointer", marginRight: 10 }} />
                <span style={{ fontWeight: 600 }}>{user.nickname || user.username}</span>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 15, display: "flex", flexDirection: "column", gap: 15 }}>
                {messages.map(m => {
                    const isMe = m.senderId === currentUser?.id;
                    return (
                        <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                            <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: 12, backgroundColor: isMe ? COLORS.primary : "white", color: isMe ? "white" : COLORS.textMain, boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
                                {m.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>
            <div style={{ padding: 10, background: "white", display: "flex", gap: 10 }}>
                <input value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: "10px 15px", borderRadius: 20, border: `1px solid ${COLORS.border}`, outline: "none" }} placeholder="发送消息..." />
                <button onClick={handleSend} style={{ backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: 20, padding: "0 20px" }}>发送</button>
            </div>
        </div>
    );
};
