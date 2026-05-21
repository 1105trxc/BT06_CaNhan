import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, googleLogin, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Diamond } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const { email, password, rememberMe } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/', { replace: true });
      return;
    }

    if (isError) {
      toast.dismiss();
      toast.error(message, { style: { background: 'var(--surface-3)', color: '#fff' } });
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.dismiss();
      toast.success('Login successful!', { style: { background: 'var(--surface-3)', color: '#fff' } });
      navigate('/', { replace: true });
      dispatch(reset());
    }
  }, [user, isLoading, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
        const profile = await res.json();
        dispatch(googleLogin({
          tokenId: tokenResponse.access_token,
          profile: {
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            sub: profile.sub
          }
        }));
      } catch (err) {
        console.warn('Frontend failed to fetch Google profile info:', err);
        dispatch(googleLogin({ tokenId: tokenResponse.access_token }));
      }
    },
    onError: () => toast.error('Google Login Failed', { style: { background: 'var(--surface-3)', color: '#fff' } }),
  });

  return (
    <Layout>
      <div className="position-relative d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg)', overflow: 'hidden' }}>
        
        {/* Background Effects */}
        <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
          <div className="position-absolute rounded-circle" style={{ width: '500px', height: '500px', background: 'var(--primary-glow)', filter: 'blur(100px)', top: '-10%', left: '-10%', zIndex: 0, animation: 'glow-pulse 8s infinite alternate' }}></div>
          <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'rgba(245, 158, 11, 0.1)', filter: 'blur(80px)', bottom: '-10%', right: '-10%', zIndex: 0, animation: 'glow-pulse 10s infinite alternate-reverse' }}></div>
        </div>

        <div className="container-xl position-relative z-1 py-5 d-flex justify-content-center">
          
          <div className="card-glass w-100 animate-fade-up" style={{ maxWidth: '480px', padding: '40px' }}>
            
            <div className="text-center mb-5">
              <Link to="/" className="d-inline-flex align-items-center justify-content-center mb-4 text-decoration-none" style={{ width: '56px', height: '56px', background: 'var(--grad-primary)', borderRadius: '16px', boxShadow: '0 0 20px var(--primary-glow)' }}>
                <Diamond size={32} color="#fff" />
              </Link>
              <h2 className="fw-bold mb-2" style={{ fontSize: '28px' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue to UTEShop</p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="form-label fw-medium" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="position-relative">
                  <Mail size={18} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="email"
                    name="email"
                    className="input-dark w-100"
                    placeholder="name@example.com"
                    value={email}
                    onChange={onChange}
                    required
                    style={{ padding: '12px 16px 12px 44px' }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Password</label>
                <div className="position-relative">
                  <Lock size={18} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="password"
                    name="password"
                    className="input-dark w-100"
                    placeholder="Enter your password"
                    value={password}
                    onChange={onChange}
                    required
                    style={{ padding: '12px 16px 12px 44px' }}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4 pb-2" style={{ fontSize: '13px' }}>
                <div className="form-check d-flex align-items-center m-0">
                  <input 
                    type="checkbox" 
                    className="form-check-input m-0 cursor-pointer" 
                    id="rememberMe" 
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={onChange}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label className="form-check-label ms-2 cursor-pointer" htmlFor="rememberMe" style={{ color: 'var(--text-muted)' }}>Remember me</label>
                </div>
                <Link to="/forgot-password" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
              </div>

              <button type="submit" className="btn-purple w-100 justify-content-center py-3 mb-4" disabled={isLoading} style={{ fontSize: '15px' }}>
                {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Log In'}
              </button>

              <div className="position-relative text-center mb-4">
                <hr className="m-0" style={{ borderColor: 'var(--border)' }} />
                <span className="position-absolute top-50 start-50 translate-middle px-3" style={{ background: 'rgba(26, 16, 48, 0.7)', color: 'var(--text-faint)', fontSize: '12px', fontWeight: 600 }}>OR</span>
              </div>

              <button 
                type="button" 
                onClick={() => handleGoogleLogin()}
                className="btn-outline-purple w-100 justify-content-center py-3 mb-4" 
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="text-center" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Don't have an account? <Link to="/register" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Login;
