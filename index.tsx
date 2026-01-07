
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { 
  Home, 
  Compass, 
  MessageSquare, 
  User, 
  Plus,
  Loader2
} from "lucide-react";

import { api } from './services/api';
import { UserInfo, PostType } from './types';
import { COLORS } from './constants';

import { LoginView, RegisterView } from './pages/AuthViews';
import { HomeView, PostDetailView } from './pages/HomeViews';
import { DiscoveryView, ProductListView, ProductDetailView, CreateProductView } from './pages/MarketViews';
import { MessagesView, ChatDetailView } from './pages/MessageViews';
import { ProfileView, UserDetailView, FollowListView, EditProfileView } from './pages/ProfileViews';

import { TabItem } from './components/UiComponents';
import { PostModal } from './components/PostModal';

const App = () => {
  const [view, setView] = useState<{name: string, data?: any}>({ name: 'loading' });
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [showPostModal, setShowPostModal] = useState<PostType | boolean>(false);

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setView({ name: 'login' });
  };

  useEffect(() => {
    api.getCurrentUser().then(user => {
      if (user && user.id) {
        setCurrentUser(user);
        setView({ name: 'tab', data: 'home' });
      } else {
        setView({ name: 'login' });
      }
    });

    const handleNavigate = (e: any) => {
      const url = e.detail?.url;
      if (url && url.includes('login')) {
        handleLogout();
      }
    };
    window.addEventListener('uni-navigateTo', handleNavigate);
    return () => window.removeEventListener('uni-navigateTo', handleNavigate);
  }, []);

  const handleLoginSuccess = (user: UserInfo) => {
    setCurrentUser(user);
    setView({ name: 'tab', data: 'home' });
  };

  const handleUpdateSuccess = (user: UserInfo) => {
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
    if (view.name === 'login') return <LoginView onLoginSuccess={handleLoginSuccess} onGoRegister={() => navigateTo('register')} />;
    if (view.name === 'register') return <RegisterView onRegisterSuccess={() => navigateTo('login')} onGoLogin={() => navigateTo('login')} />;
    if (view.name === 'postDetail') return <PostDetailView id={view.data} onBack={() => navigateTo('tab', 'home')} navigateTo={navigateTo} />;
    if (view.name === 'userDetail') return <UserDetailView id={view.data} onBack={() => navigateTo('tab', 'home')} navigateTo={navigateTo} currentUser={currentUser} />;
    if (view.name === 'chatDetail') return <ChatDetailView user={view.data} onBack={() => navigateTo('tab', 'messages')} currentUser={currentUser} />;
    if (view.name === 'editProfile') return <EditProfileView currentUser={currentUser} onBack={() => navigateTo('tab', 'profile')} onUpdate={handleUpdateSuccess} />;
    if (view.name === 'followList') return <FollowListView type={view.data.type} userId={view.data.userId} onBack={() => navigateTo('tab', 'profile')} navigateTo={navigateTo} />;
    if (view.name === 'productList') return <ProductListView navigateTo={navigateTo} onBack={() => navigateTo('tab', 'discovery')} />;
    if (view.name === 'createProduct') return <CreateProductView onBack={() => navigateTo('productList')} onCreated={() => navigateTo('productList')} />;
    if (view.name === 'productDetail') return <ProductDetailView id={view.data} onBack={() => navigateTo('productList')} navigateTo={navigateTo} currentUser={currentUser} />;
    
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

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
