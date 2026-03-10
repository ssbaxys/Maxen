import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { auth, db } from '../../lib/firebase/init';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { Mail, Lock, User as UserIcon, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFriendlyAuthError } from '../../utils/authErrors';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';

const Register = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visualNick, setVisualNick] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [authUid, setAuthUid] = useState<string | null>(null);
    const [authEmail, setAuthEmail] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEmailPassSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!captchaToken) return setError('Please complete the captcha first');
        setError('');
        setIsSubmitting(true);
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            setAuthUid(cred.user.uid);
            setAuthEmail(cred.user.email);
            setStep(2);
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignup = async () => {
        if (!captchaToken) return setError('Please complete the captcha first');
        setError('');
        setIsSubmitting(true);
        const provider = new GoogleAuthProvider();
        try {
            const cred = await signInWithPopup(auth, provider);
            setAuthUid(cred.user.uid);
            setAuthEmail(cred.user.email);
            setStep(2);
        } catch (err: any) {
            setError(getFriendlyAuthError(err.code || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const finishRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visualNick.trim()) return setError('Please enter a visual nickname');
        if (!authUid) return setError('Authentication lost. Please restart.');
        setIsSubmitting(true);

        try {
            await set(ref(db, `users/${authUid}`), {
                email: authEmail,
                visualNick: visualNick.trim(),
                createdAt: Date.now(),
                root: false
            });
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
            <div className="bg-surface border border-border w-full max-w-md p-8 rounded-xl relative z-10 shadow-lg">

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-bold text-foreground mb-1 text-center">{t('Join Maxen')}</h2>
                            <p className="text-muted-foreground text-sm text-center mb-6">{t('Step 1: Create Account')}</p>

                            {error && <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm border border-danger/20">{error}</div>}

                            <div className="flex flex-col items-center justify-center mb-6 p-4 bg-background border border-border rounded-lg">
                                <div className="flex items-center gap-2 mb-3 text-muted-foreground text-sm font-medium">
                                    <ShieldCheck size={16} className="text-secondary" /> {t('Verify you are human')}
                                </div>
                                <Turnstile
                                    siteKey={window.location.hostname === 'localhost' ? '1x00000000000000000000AA' : '0x4AAAAAACoXCJKe8ZVWDkkz'}
                                    onSuccess={(token) => setCaptchaToken(token)}
                                />
                            </div>

                            <form onSubmit={handleEmailPassSignup} className="space-y-3">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('Email address')} required className={inputClass} disabled={!captchaToken || isSubmitting} />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('Password')} required minLength={6} className={inputClass} disabled={!captchaToken || isSubmitting} />
                                </div>

                                <Button type="submit" disabled={!captchaToken || isSubmitting} className="w-full h-10 mt-1">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('Create Account')}
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative flex items-center py-4">
                                    <div className="flex-grow border-t border-border"></div>
                                    <span className="flex-shrink-0 mx-4 text-muted-foreground text-xs font-medium tracking-wider uppercase">{t('Or via')}</span>
                                    <div className="flex-grow border-t border-border"></div>
                                </div>
                                <Button variant="outline" onClick={handleGoogleSignup} disabled={!captchaToken || isSubmitting} className="w-full h-10 gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (
                                        <>
                                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                            {t('Google Signup')}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-bold text-foreground mb-1 text-center">{t('Your Profile')}</h2>
                            <p className="text-muted-foreground text-sm text-center mb-8">{t('Step 2: Choose a Visual Nickname')}</p>

                            {error && <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm border border-danger/20">{error}</div>}

                            <form onSubmit={finishRegistration}>
                                <div className="space-y-4 mb-8">
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                        <input type="text" value={visualNick} onChange={e => setVisualNick(e.target.value)} placeholder="Visual Nickname (e.g. ProServerOwner)" required className={inputClass} disabled={isSubmitting} />
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">This is how you will appear to others on the platform.</p>
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full h-10 mb-4">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : t('Finish & Go to Dashboard')}
                                </Button>
                            </form>
                        </motion.div>
                    )}

                </AnimatePresence>

                {step === 1 && (
                    <p className="mt-8 text-center text-muted-foreground text-sm">
                        {t('Already have an account?')} <Link to="/login" className="text-foreground font-semibold hover:text-primary transition-colors">{t('Log in here')}</Link>
                    </p>
                )}

            </div>
        </div>
    );
};

export default Register;
