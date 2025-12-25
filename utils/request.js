
// 根据环境变量选择接口地址
const isProduction = process.env.NODE_ENV === 'production';
// export const BASE_URL = isProduction 
//   ? 'https://shequ-node.vercel.app' 
//   : 'http://127.0.0.1:5000';、
export const BASE_URL = 'https://shequ-node1-211409-7-1307840261.sh.run.tcloudbase.com'
export const API_URL = `${BASE_URL}/api/v1`;

export const formatUrl = (url) => {
  if (!url) return '';
  let urlStr = typeof url === 'string' ? url : (url.url || url.fileUrl || '');
  if (!urlStr) return '';
  if (urlStr.startsWith('http')) return urlStr;
  const path = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
  return `${BASE_URL}${path}`;
};

// 本地存储工具函数
const storage = {
  get: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage error:', e);
    }
  }
};

// 导航工具函数
const navigate = {
  to: (url) => {
    // 对于React应用，通常使用路由库进行导航
    // 这里使用简单的页面跳转作为 fallback
    window.location.href = url;
  }
};

// 消息提示工具函数
const showToast = (options) => {
  // 简单的消息提示实现
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 4px;
    z-index: 9999;
  `;
  toast.textContent = options.title;
  document.body.appendChild(toast);
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 2000);
};

export const request = (options) => {
  const token = storage.get('token');
  return new Promise((resolve, reject) => {
    fetch(options.url.startsWith('http') ? options.url : API_URL + options.url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      body: options.data ? JSON.stringify(options.data) : undefined
    })
    .then(async (res) => {
      const data = await res.json();
      // 兼容处理：有些接口返回带 code 的对象，有些严格按照文档直接返回数据数组/对象
      if (res.ok) {
        resolve(data);
      } else if (res.status === 401) {
        storage.remove('token');
        navigate.to('/login');
        reject(data);
      } else {
        showToast({ title: data.message || 'Error' });
        reject(data);
      }
    })
    .catch((err) => {
      showToast({ title: 'Network error' });
      reject(err);
    });
  });
};
