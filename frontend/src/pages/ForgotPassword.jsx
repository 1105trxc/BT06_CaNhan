import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message, { style: { background: 'var(--surface-3)', color: '#fff' } });
      dispatch(reset());
    }

    if (isSuccess && message === 'OTP has been sent to your email') {
      setSubmitted(true);
      dispatch(reset());
    }
  }, [isError, isSuccess, message, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address', { style: { background: 'var(--surface-3)', color: '#fff' } });
      return;
    }
    dispatch(forgotPassword(email));
  };

  return (
    <Layout>
      <div className="position-relative d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg)', overflow: 'hidden' }}>
        
        {/* Background Effects */}
        <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
          <div className="position-absolute rounded-circle" style={{ width: '500px', height: '500px', background: 'var(--primary-glow)', filter: 'blur(100px)', top: '10%', left: '20%', zIndex: 0, animation: 'glow-pulse 8s infinite alternate' }}></div>
        </div>

        <div className="container-xl position-relative z-1 d-flex justify-content-center flex-column align-items-center">
          
          <div className="card-glass w-100 animate-fade-up text-center" style={{ maxWidth: '480px', padding: '40px' }}>
            
            {!submitted ? (
              <>
                <div className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle" style={{ width: '64px', height: '64px', background: 'var(--surface-3)', color: 'var(--primary-light)', boxShadow: '0 0 20px var(--primary-glow)' }}>
                  <ShieldAlert size={32} />
                </div>
                
                <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Forgot Password?</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={onSubmit} className="text-start">
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ padding: '12px 16px 12px 44px' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-purple w-100 justify-content-center py-3 mb-4" disabled={isLoading} style={{ fontSize: '15px' }}>
                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Send Reset Link'}
                  </button>
                </form>

                <Link to="/login" className="d-inline-flex align-items-center gap-2" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </>
            ) : (
              <>
                <div className="d-inline-flex align-items-center justify-content-center mb-4 rounded-circle" style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <CheckCircle2 size={32} />
                </div>
                
                <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Check Your Email</h2>
                <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
                  We've sent a recovery link to your registered email address. Please check your inbox.
                </p>

                <button onClick={() => navigate('/reset-password', { state: { email } })} className="btn-purple w-100 justify-content-center py-3 mb-4" style={{ fontSize: '15px' }}>
                  Enter Reset Code
                </button>

                <div className="mb-4" style={{ fontSize: '13px', color: 'var(--text-faint)' }}>
                  Didn't receive the email? Check your spam folder.
                </div>
                
                <Link to="/login" className="d-inline-flex align-items-center gap-2" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </>
            )}
          </div>

          {!submitted && (
            <p className="mt-4 text-center" style={{ color: 'var(--text-faint)', fontSize: '13px' }}>
              If you're having trouble receiving the email, please check your spam folder or contact Support.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
