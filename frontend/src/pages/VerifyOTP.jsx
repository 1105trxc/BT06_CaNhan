import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerUser, sendOTP, reset } from '../redux/authSlice';
import PrimaryButton from '../components/PrimaryButton';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { regData } = location.state || {};

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!regData) {
      navigate('/register');
    }
  }, [regData, navigate]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess && message === 'Registration successful') {
      toast.dismiss();
      toast.success(message || 'Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      dispatch(reset());
    }
    
    if (isSuccess && message === 'OTP has been sent to your email') {
      toast.dismiss();
      toast.success('OTP resent successfully!');
      setTimer(59);
      setCanResend(false);
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const onResendOTP = () => {
    if (canResend) {
      dispatch(sendOTP(regData.email));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      toast.dismiss();
      toast.error('Please enter all 6 digits');
      return;
    }

    const userData = {
      full_name: regData.fullName,
      email: regData.email.trim(),
      password: regData.password,
      otp_code: otpCode,
    };
    dispatch(registerUser(userData));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="position-relative d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg)', overflow: 'hidden' }}>
        
        {/* Background Effects */}
        <div className="position-absolute top-0 start-0 w-100 h-100 z-0">
          <div className="position-absolute rounded-circle" style={{ width: '600px', height: '600px', background: 'var(--primary-glow)', filter: 'blur(120px)', top: '-20%', right: '-10%', zIndex: 0, animation: 'glow-pulse 10s infinite alternate' }}></div>
          <div className="position-absolute rounded-circle" style={{ width: '400px', height: '400px', background: 'rgba(124, 58, 237, 0.1)', filter: 'blur(80px)', bottom: '-10%', left: '-10%', zIndex: 0, animation: 'glow-pulse 8s infinite alternate-reverse' }}></div>
        </div>

        <div className="container-xl position-relative z-1 d-flex flex-column align-items-center justify-content-center">
          
          <div className="card-glass w-100 animate-fade-up text-center" style={{ maxWidth: '480px', padding: '40px' }}>
            <div className="mx-auto mb-4 d-flex align-items-center justify-content-center" 
                 style={{ width: '64px', height: '64px', background: 'var(--grad-primary)', borderRadius: '18px', boxShadow: '0 0 20px var(--primary-glow)', color: '#fff' }}>
              <i className="fa-solid fa-shield-halved fs-3"></i>
            </div>
            
            <h2 className="fw-bold mb-2" style={{ fontSize: '28px', color: 'var(--text-primary)' }}>Verify Identity</h2>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
              We've sent a 6-digit verification code to<br />
              <strong style={{ color: 'var(--text-primary)' }}>{regData?.email}</strong>
            </p>

            <form onSubmit={onSubmit}>
              <div className="d-flex justify-content-between gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    className="input-dark text-center fw-bold fs-4"
                    style={{ width: '52px', height: '60px' }}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>

              <div className="timer-info small mb-2 d-flex align-items-center justify-content-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <i className="fa-regular fa-clock"></i>
                Resend code in <span className="fw-bold" style={{ color: 'var(--primary)' }}>{formatTime(timer)}</span>
              </div>

              <button 
                type="button"
                className={`btn btn-link p-0 small fw-bold mb-4 text-decoration-none ${canResend ? '' : 'disabled'}`}
                disabled={!canResend}
                onClick={onResendOTP}
                style={{ 
                  cursor: canResend ? 'pointer' : 'not-allowed', 
                  color: canResend ? 'var(--primary)' : 'var(--text-muted)' 
                }}
              >
                <i className="fa-solid fa-arrow-rotate-right me-2"></i>
                Resend OTP
              </button>

              <PrimaryButton type="submit" isLoading={isLoading} className="py-3 rounded-3 mb-4 shadow-sm w-100">
                Verify & Continue
              </PrimaryButton>
            </form>

            <div className="border-top w-75 mx-auto mb-4" style={{ borderColor: 'var(--border)' }}></div>

            <button onClick={() => navigate('/register')} className="btn btn-link small text-decoration-none mb-4 fw-medium" style={{ color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-arrow-left me-2"></i> Back to registration
            </button>

            <p className="small fst-italic px-4" style={{ color: 'var(--text-secondary)' }}>
              Didn't receive the email? Check your spam folder or try another address.
            </p>
          </div>

          <div className="mt-4 d-flex gap-4 text-muted small fw-bold" style={{ letterSpacing: '1px', fontSize: '10px' }}>
            <a href="#" className="text-decoration-none text-muted hover-dark">PRIVACY POLICY</a>
            <span>&bull;</span>
            <a href="#" className="text-decoration-none text-muted hover-dark">TERMS OF SERVICE</a>
            <span>&bull;</span>
            <a href="#" className="text-decoration-none text-muted hover-dark">HELP CENTER</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyOTP;
