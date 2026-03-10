import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../lib/firebase/init';
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from 'firebase/auth';
import { ref, get, set } from 'firebase/database';
import { Mail, Lock, Phone as PhoneIcon, Loader2 } from 'lucide-react';
import { getFriendlyAuthError } from '../../utils/authErrors';

const Login = () => {
    const navigate = useNavigate();
    const [method, setMethod] = useState<'email' | 'phone' | 'passwordless'>('email');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const provisionUserIfMissing = async (user: any, fallbackContact: string | null) => {
        const userRef = ref(db, `users/${user.uid}`);
        const snap = await get(userRef);
        if (!snap.exists()) {
            await set(userRef, {
                email: user.email || fallbackContact || null,
                phoneNumber: user.phoneNumber || (method === 'phone' ? fallbackContact : null),
                visualNick: `User${user.uid.slice(0, 5)}`,
                createdAt: Date.now(),
                root: false
            });
        }
    };

    useEffect(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let savedEmail = window.localStorage.getItem('emailForSignIn');
            if (!savedEmail) {
                savedEmail = window.prompt('Please provide your email for confirmation');
            }
            if (savedEmail) {
                setIsSubmitting(true);
                signInWithEmailLink(auth, savedEmail, window.location.href)
                    .then(async (cred) => {
                        window.localStorage.removeItem('emailForSignIn');
                        await provisionUserIfMissing(cred.user, savedEmail);
                        navigate('/dashboard');
                    })
                    .catch((err) => {
                        setError(getFriendlyAuthError(err.code || err.message));
                        setIsSubmitting(false);
                    });
            }
        }
    }, [navigate]);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setIsSubmitting(true);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            client_id: "812394006704-pbur9bn1p3q4b9ear2es0th5sgobon03.apps.googleusercontent.com"
        });
        try {
            const cred = await signInWithPopup(auth, provider);
            await provisionUserIfMissing(cred.user, cred.user.email);
            navigate('/dashboard');
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordless = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setIsSubmitting(true);
        const actionCodeSettings = {
            url: window.location.origin + '/login',
            handleCodeInApp: true,
        };
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem('emailForSignIn', email);
            setMsg('Email sent! Check your inbox to login.');
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const setupRecaptcha = () => {
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    const handlePhoneLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        setupRecaptcha();
        const appVerifier = (window as any).recaptchaVerifier;
        try {
            const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
            (window as any).confirmationResult = confirmationResult;
            setShowOtp(true);
            setMsg('OTP Sent to your phone');
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code || err.message));
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const cred = await (window as any).confirmationResult.confirm(otp);
            await provisionUserIfMissing(cred.user, phone);
            navigate('/dashboard');
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="bg-surface border border-border w-full max-w-md p-8 rounded-3xl relative z-10 animate-slide-up">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted mb-2 text-center">Welcome Back</h2>
                <p className="text-textMuted text-center mb-8">Access your premium Maxen servers</p>

                {error && <div className="bg-danger/20 text-red-300 p-3 rounded-xl mb-4 text-sm border border-danger/20">{error}</div>}
                {msg && <div className="bg-secondary/20 text-emerald-300 p-3 rounded-xl mb-4 text-sm border border-secondary/20">{msg}</div>}

                <div className="flex gap-2 mb-6 p-1 bg-white/5 border border-white/10 rounded-xl">
                    {(['email', 'passwordless', 'phone'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setMethod(m)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${method === m ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-textMuted hover:text-white'}`}
                        >
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                </div>

                {method === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white disabled:opacity-50" disabled={isSubmitting} />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white disabled:opacity-50" disabled={isSubmitting} />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary/25 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
                        </button>
                    </form>
                )}

                {method === 'passwordless' && (
                    <form onSubmit={handlePasswordless} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white disabled:opacity-50" disabled={isSubmitting} />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Send Magic Link'}
                        </button>
                    </form>
                )}

                {method === 'phone' && (
                    <form onSubmit={showOtp ? verifyOtp : handlePhoneLogin} className="space-y-4">
                        {!showOtp ? (
                            <>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" required className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white disabled:opacity-50" disabled={isSubmitting} />
                                </div>
                                <div id="recaptcha-container"></div>
                                <button type="submit" disabled={isSubmitting} className="w-full bg-secondary hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-secondary/25 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
                                </button>
                            </>
                        ) : (
                            <>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" required className="w-full bg-surface border border-white/10 rounded-xl py-3 px-4 text-center tracking-widest outline-none focus:border-secondary transition-all text-white text-xl disabled:opacity-50" disabled={isSubmitting} />
                                <button type="submit" disabled={isSubmitting} className="w-full bg-secondary hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-secondary/25 transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Verify OTP'}
                                </button>
                            </>
                        )}
                    </form>
                )}

                <div className="mt-6">
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-textMuted text-xs font-medium tracking-wider uppercase">Or continue with</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <button onClick={handleGoogleLogin} disabled={isSubmitting} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </>
                        )}
                    </button>
                </div>

                <p className="mt-8 text-center text-textMuted text-sm">
                    Don't have an account? <Link to="/register" className="text-white font-semibold hover:text-primary transition-colors underline decoration-white/30 hover:decoration-primary">Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
