
// Polyfill for Web/React environment to simulate UniApp APIs
if (typeof window !== 'undefined' && !window.uni) {
  window.uni = {
    getStorageSync(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) { return null; }
    },
    setStorageSync(key, data) {
      try {
        localStorage.setItem(key, data);
      } catch (e) {}
    },
    removeStorageSync(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
    showToast(options) {
      const { title, icon } = options || {};
      const titleStr = typeof title === 'object' ? JSON.stringify(title) : String(title || 'Notification');
      console.log(`[Toast]: ${titleStr}`);
      
      const existingToast = document.getElementById('uni-toast');
      if (existingToast) existingToast.remove();

      const toast = document.createElement('div');
      toast.id = 'uni-toast';
      toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.75);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        transition: opacity 0.3s;
        pointer-events: none;
      `;
      toast.textContent = titleStr;
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    },
    showLoading(options) {
      const { title } = options || {};
      const existing = document.getElementById('uni-loading');
      if (existing) return;
      
      const loading = document.createElement('div');
      loading.id = 'uni-loading';
      loading.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.1); z-index: 9999;
        display: flex; align-items: center; justify-content: center;
      `;
      loading.innerHTML = `
        <div style="background: rgba(0,0,0,0.7); color: white; padding: 15px; border-radius: 8px; display: flex; flex-direction: column; align-items: center;">
          <div style="border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite; margin-bottom: 8px;"></div>
          <div style="font-size: 14px;">${title || 'Loading'}</div>
        </div>
      `;
      document.body.appendChild(loading);
    },
    hideLoading() {
      const existing = document.getElementById('uni-loading');
      if (existing) existing.remove();
    },
    navigateTo(options) {
      const { url } = options || {};
      // Dispatch event for React app to handle navigation
      window.dispatchEvent(new CustomEvent('uni-navigateTo', { detail: { url } }));
    },
    request(options) {
      const { url, method = 'GET', data, header, success, fail } = options;
      
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...header,
        },
      };

      if (method !== 'GET' && method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(data);
      }

      fetch(url, fetchOptions)
        .then(async (response) => {
          const res = {
            statusCode: response.status,
            header: {},
            data: null,
          };
          
          response.headers.forEach((val, key) => {
            res.header[key] = val;
          });

          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              res.data = await response.json();
            } catch(e) { res.data = {}; }
          } else {
            res.data = await response.text();
          }

          if (success) success(res);
        })
        .catch((error) => {
          if (fail) fail(error);
        });
    }
  };
}

// 使用 '127.0.0.1' 代替 'localhost' 以提高在不同开发环境（如浏览器、模拟器）下的兼容性。
// export const BASE_IP = '127.0.0.1'; 
export const BASE_URL = `https://shequ-node1-211409-7-1307840261.sh.run.tcloudbase.com`; 
// export const BASE_URL = `http://${BASE_IP}:5000`; 
const API_URL = `${BASE_URL}/api/v1`;

export const formatUrl = (url) => {
  if (!url) return '';
  // Handle objects containing url/fileUrl properties
  let urlStr = typeof url === 'string' ? url : (url.url || url.fileUrl || '');
  if (!urlStr) return '';
  
  // CRITICAL FIX: Replace Windows backslashes with forward slashes
  urlStr = urlStr.replace(/\\/g, '/');

  if (urlStr.startsWith('http')) return urlStr;
  
  const path = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
  return `${BASE_URL}${path}`;
};

export const toast = {
  show: (options) => {
    if (typeof window !== 'undefined' && window.uni) {
      window.uni.showToast(options);
    }
  }
};

export const request = (options) => {
  const token = typeof window !== 'undefined' && window.uni ? window.uni.getStorageSync('token') : null;
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.uni) {
        reject('uni object not found');
        return;
    }
    window.uni.request({
      url: options.url.startsWith('http') ? options.url : API_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        // 1. Check HTTP Status Code
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2. Check Backend Custom Code (if present)
          if (res.data && typeof res.data.code !== 'undefined') {
             if (res.data.code !== 200 && res.data.code !== 201) {
                 let msg = res.data.message || 'Error';
                 if (typeof msg === 'object') msg = JSON.stringify(msg);
                 window.uni.showToast({ title: msg, icon: 'none' });
                 reject(res.data);
             } else {
                 // Unwrap data property if it exists, otherwise return the whole object
                 // This aligns with common API patterns where 'data' wrapper is used
                 resolve(res.data.data !== undefined ? res.data.data : res.data);
             }
          } else {
             // No code field, just return the data
             resolve(res.data);
          }
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          // Auth failed
          window.uni.removeStorageSync('token');
          window.dispatchEvent(new CustomEvent('uni-navigateTo', { detail: { url: '/pages/login/login' } }));
          reject(res.data);
        } else {
          // Other Errors
          let msg = (res.data && res.data.message) ? res.data.message : `API Error: ${res.statusCode}`;
          if (typeof msg === 'object') msg = JSON.stringify(msg);
          window.uni.showToast({ title: msg, icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        const msg = err.message ? err.message : 'Network error';
        window.uni.showToast({ title: msg, icon: 'none' });
        reject(err);
      }
    });
  });
};
