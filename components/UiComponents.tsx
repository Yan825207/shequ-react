
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { COLORS } from '../constants';

export const TabItem = ({ icon, active, label, onClick }: any) => (
  <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", color: active ? COLORS.primary : "#b2bec3", cursor: "pointer" }}>
    {icon}
    <span style={{ fontSize: 10, marginTop: 4, fontWeight: active ? 600 : 400 }}>{label}</span>
  </div>
);

export const MenuItem = ({ icon, label, onClick }: any) => (
  <div onClick={onClick} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer" }}>
     <div style={{ color: COLORS.textSub, marginRight: 15 }}>{icon}</div>
     <div style={{ flex: 1, fontSize: 15 }}>{label}</div>
     <ChevronRight size={18} color="#ccc" />
  </div>
);
