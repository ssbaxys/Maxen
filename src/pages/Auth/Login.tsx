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
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';

const Login = () => {
    const { t } = useTranslation();
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
                phoneNumber: user.phoneNumber || fallbackContact || null,
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

        return () => {
            // Cleanup recaptcha on unmount
            if ((window as any).recaptchaVerifier) {
                try {
                    (window as any).recaptchaVerifier.clear();
                } catch (_) { /* ignore */ }
                (window as any).recaptchaVerifier = null;
            }
        };
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

    const inputClass = "w-full bg-background border border-border rounded-lg py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-ring transition-all text-foreground disabled:opacity-50 text-sm";

    return (
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="bg-surface border border-border w-full max-w-md p-8 rounded-xl relative z-10 animate-slide-up shadow-lg">
                <h2 className="text-2xl font-bold text-foreground mb-1 text-center">{t('Welcome Back')}</h2>
                <p className="text-muted-foreground text-sm text-center mb-8">{t('Access your premium Maxen servers')}</p>

                {error && <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm border border-danger/20">{error}</div>}
                {msg && <div className="bg-secondary/10 text-secondary p-3 rounded-lg mb-4 text-sm border border-secondary/20">{msg}</div>}

                <div className="flex gap-1 mb-6 p-1 bg-muted border border-border rounded-lg">
                    {(['email', 'passwordless', 'phone'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setMethod(m)}
                            className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${method === m ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {t(m.charAt(0).toUpperCase() + m.slice(1))}
                        </button>
                    ))}
                </div>

                {method === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-3">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('Email address')} required className={inputClass} disabled={isSubmitting} />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('Password')} required className={inputClass} disabled={isSubmitting} />
                        </div>
                        <Button type="submit" disabled={isSubmitting} className="w-full h-10">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('Sign In')}
                        </Button>
                    </form>
                )}

                {method === 'passwordless' && (
                    <form onSubmit={handlePasswordless} className="space-y-3">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('Email address')} required className={inputClass} disabled={isSubmitting} />
                        </div>
                        <Button type="submit" disabled={isSubmitting} variant="secondary" className="w-full h-10">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('Send Magic Link')}
                        </Button>
                    </form>
                )}

                {method === 'phone' && (
                    <form onSubmit={showOtp ? verifyOtp : handlePhoneLogin} className="space-y-3">
                        {!showOtp ? (
                            <>
                                <div className="relative">
                                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" required className={inputClass} disabled={isSubmitting} />
                                </div>
                                <div id="recaptcha-container"></div>
                                <Button type="submit" disabled={isSubmitting} className="w-full h-10">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('Send OTP')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-digit OTP" required className="w-full bg-background border border-border rounded-lg py-3 px-4 text-center tracking-widest outline-none focus:border-primary transition-all text-foreground text-lg font-mono disabled:opacity-50" disabled={isSubmitting} />
                                <Button type="submit" disabled={isSubmitting} className="w-full h-10">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('Verify OTP')}
                                </Button>
                            </>
                        )}
                    </form>
                )}

                <div className="mt-6">
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-border"></div>
                        <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-medium tracking-wider uppercase">{t('Or continue with')}</span>
                        <div className="flex-grow border-t border-border"></div>
                    </div>

                    <Button variant="outline" onClick={handleGoogleLogin} disabled={isSubmitting} className="w-full h-10 gap-2">
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                            <>
                                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </>
                        )}
                    </Button>
                </div>

                <p className="mt-8 text-center text-muted-foreground text-sm">
                    {t("Don't have an account?")} <Link to="/register" className="text-foreground font-semibold hover:text-primary transition-colors">{t('Create an account')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
