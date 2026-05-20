import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { sendOTP, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Diamond, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { fullName, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      toast.dismiss();
      toast.success(message, { style: { background: 'var(--surface-3)', color: '#fff' } });
      navigate('/verify-otp', { state: { regData: formData } });
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch, formData]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordPolicy.test(password)) {
      toast.dismiss();
      toast.error('Password must include uppercase, lowercase, numbers, and special characters', { style: { background: 'var(--surface-3)', color: '#fff' } });
      return;
    }

    if (password !== confirmPassword) {
      toast.dismiss();
      toast.error('Passwords do not match', { style: { background: 'var(--surface-3)', color: '#fff' } });
    } else {
      dispatch(sendOTP(email.trim()));
    }
  };

  return (
    <Layout>
      <div className="position-relative d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg)', overflow: 'hidden' }}>
        
        {/* Background Effects */}
        <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
          <div className="position-absolute rounded-circle" style={{ width: '600px', height: '600px', background: 'var(--primary-glow)', filter: 'blur(120px)', top: '-20%', right: '-10%', zIndex: 0, animation: 'glow-pulse 10s infinite alternate' }}></div>
          <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'rgba(124, 58, 237, 0.1)', filter: 'blur(80px)', bottom: '-10%', left: '-10%', zIndex: 0, animation: 'glow-pulse 8s infinite alternate-reverse' }}></div>
        </div>

        <div className="container-xl position-relative z-1 d-flex justify-content-center">
          
          <div className="card-glass w-100 animate-fade-up" style={{ maxWidth: '520px', padding: '40px' }}>
            
            <div className="text-center mb-4">
              <Link to="/" className="d-inline-flex align-items-center justify-content-center mb-4 text-decoration-none" style={{ width: '56px', height: '56px', background: 'var(--grad-primary)', borderRadius: '16px', boxShadow: '0 0 20px var(--primary-glow)' }}>
                <Diamond size={32} color="#fff" />
              </Link>
              <h2 className="fw-bold mb-2" style={{ fontSize: '28px' }}>Create an Account</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Join UTEShop to start discovering premium products</p>
            </div>

            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label className="form-label fw-medium" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Full Name</label>
                <div className="position-relative">
                  <User size={18} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    name="fullName"
                    className="input-dark w-100"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={onChange}
                    required
                    style={{ padding: '12px 16px 12px 44px' }}
                  />
                </div>
              </div>

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

              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <label className="form-label fw-medium" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Password</label>
                  <div className="position-relative">
                    <Lock size={18} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-faint)' }} />
                    <input
                      type="password"
                      name="password"
                      className="input-dark w-100"
                      placeholder="Create password"
                      value={password}
                      onChange={onChange}
                      required
                      style={{ padding: '12px 16px 12px 44px' }}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-medium" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Confirm Password</label>
                  <div className="position-relative">
                    <Lock size={18} className="position-absolute top-50 translate-middle-y ms-3" style={{ color: 'var(--text-faint)' }} />
                    <input
                      type="password"
                      name="confirmPassword"
                      className="input-dark w-100"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={onChange}
                      required
                      style={{ padding: '12px 16px 12px 44px' }}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-purple w-100 justify-content-center py-3 mb-4" disabled={isLoading} style={{ fontSize: '15px' }}>
                {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Create Account'}
              </button>

              <div className="d-flex align-items-center justify-content-center gap-2 mb-4" style={{ fontSize: '12px', color: 'var(--text-faint)' }}>
                <ShieldCheck size={14} color="#10B981" /> Your data is protected by industry standard encryption
              </div>

              <div className="text-center" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
              </div>
            </form>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Register;
