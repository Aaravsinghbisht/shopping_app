import React, { useState, useRef } from 'react';
import { UserPlus, LogIn, Mail, Lock, User, Camera, X, Check } from 'lucide-react';
import './AuthPage.css';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'Dekds6naj';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'default_bear';
const API_KEY = 'EhBZCQ3j_NzLNIotVzla2CBxcGo';

export default function AuthPage({ onAuth, onBack }) {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState('');
  const [resending, setResending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verification') === 'success') {
      setVerificationStatus('success');
      window.history.replaceState({}, '', window.location.pathname);
    } else if (params.get('verification') === 'failed') {
      setVerificationStatus('failed');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return '';
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', avatarFile);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('api_key', API_KEY);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      throw new Error(data.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification('');

    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }
    if (mode === 'register') {
      if (!form.name) { setError('Name is required'); return; }
      if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    }

    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = { email: form.email, password: form.password };
      if (mode === 'register') {
        body.name = form.name;
        body.avatar = await uploadAvatar();
      }

      const res = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          setNeedsVerification(form.email);
        }
        throw new Error(data.error || 'Something went wrong');
      }

      if (mode === 'register') {
        setRegisteredEmail(form.email);
        return;
      }

      localStorage.setItem('wizago_token', data.token);
      localStorage.setItem('wizago_user', JSON.stringify(data.user));
      onAuth(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!needsVerification) return;
    setResending(true);
    try {
      const res = await fetch('http://localhost:3001/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: needsVerification }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend');
      setRegisteredEmail(needsVerification);
      setNeedsVerification('');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  if (registeredEmail) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">Wizago Shop</div>
            <h1 className="auth-title">Verify Your Email</h1>
          </div>
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              We sent a verification email to:
            </p>
            <p style={{ fontSize: '1rem', color: '#5a5a5a', marginBottom: '1.5rem' }}>
              {registeredEmail}
            </p>
            <p style={{ color: '#888', lineHeight: 1.6, marginBottom: '2rem' }}>
              Click the link in the email to activate your account, then sign in.
            </p>
            <button className="neo-btn primary" onClick={() => { setRegisteredEmail(''); setMode('login'); setForm({ ...form, password: '', confirm: '' }); }}>
              <LogIn size={15} /> Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">Wizago Shop</div>
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Join the Circle'}
          </h1>
          <p className="auth-sub">
            {mode === 'login'
              ? 'Sign in to cast your manifests'
              : 'Create your wizard account to start dispatching'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!verificationStatus && error && !needsVerification && (
            <div className="auth-error">
              <X size={14} />
              {error}
            </div>
          )}
          {needsVerification && (
            <div className="auth-error" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <X size={14} />
                {error}
              </div>
              <button className="neo-btn neo-btn-sm" onClick={handleResend} disabled={resending} style={{ width: '100%', justifyContent: 'center' }}>
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          )}
          {verificationStatus === 'success' && (
            <div className="auth-success">
              <Check size={14} /> Email verified! You can now sign in.
            </div>
          )}
          {verificationStatus === 'failed' && (
            <div className="auth-error">
              <X size={14} /> Verification link is invalid or expired. Please register again.
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="auth-avatar-section">
                <div className="auth-avatar-circle" onClick={() => fileRef.current?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <Camera size={22} />
                  )}
                  {uploading && <div className="auth-avatar-spinner" />}
                </div>
                <span className="auth-avatar-label">Upload wizard portrait</span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="form-group">
                <label><User size={13} /> Wizard Name</label>
                <input className="neo-input" placeholder="e.g. Albus D." value={form.name} onChange={update('name')} />
              </div>
            </>
          )}

          <div className="form-group">
            <label><Mail size={13} /> Email</label>
            <input className="neo-input" type="email" placeholder="wizard@wizago.com" value={form.email} onChange={update('email')} />
          </div>

          <div className="form-group">
            <label><Lock size={13} /> Password</label>
            <input className="neo-input" type="password" placeholder="••••••••" value={form.password} onChange={update('password')} />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label><Lock size={13} /> Confirm Password</label>
              <input className="neo-input" type="password" placeholder="Confirm your password" value={form.confirm} onChange={update('confirm')} />
            </div>
          )}

          <button type="submit" className="neo-btn primary auth-submit" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === 'login' ? (
              <><LogIn size={15} /> Sign In</>
            ) : (
              <><UserPlus size={15} /> Register</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
          <button className="auth-switch" onClick={switchMode}>
            {mode === 'login' ? 'Register here' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
