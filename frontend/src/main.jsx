import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import axios from 'axios'

// Global 401 interceptor: tự động logout khi token không hợp lệ (vd: sau khi re-seed DB)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('token');
      if (hadToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Reload để reset Redux state và đưa user về trang login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const GOOGLE_CLIENT_ID = "408847171120-dldrof0cc90f3nn19qsl7amrl7fpc9jc.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>,
)
