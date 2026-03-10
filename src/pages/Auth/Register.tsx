import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { auth, db } from '../../firebase';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [visualNick, setVisualNick] = useState('');
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [authUid, setAuthUid] = useState<string | null>(null);
    const [authEmail, setAuthEmail] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleEmailPassSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!captchaToken) return setError('Please complete the captcha first');
        setError('');
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            setAuthUid(cred.user.uid);
            setAuthEmail(cred.user.email);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleGoogleSignup = async () => {
        if (!captchaToken) return setError('Please complete the captcha first');
        setError('');
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            client_id: "812394006704-pbur9bn1p3q4b9ear2es0th5sgobon03.apps.googleusercontent.com"
        });
        try {
            const cred = await signInWithPopup(auth, provider);
            setAuthUid(cred.user.uid);
            setAuthEmail(cred.user.email);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const finishRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visualNick.trim()) return setError('Please enter a visual nickname');
        if (!authUid) return setError('Authentication lost. Please restart.');

        try {
            await set(ref(db, `users/${authUid}`), {
                email: authEmail,
                visualNick: visualNick.trim(),
                createdAt: Date.now(),
                root: false
            });
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative z-10 transition-all duration-300">

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted mb-2 text-center">Join Maxen</h2>
                            <p className="text-textMuted text-center mb-6">Step 1: Create Account</p>

                            {error && <div className="bg-danger/20 text-red-300 p-3 rounded-xl mb-4 text-sm border border-danger/20">{error}</div>}

                            <div className="flex flex-col items-center justify-center mb-6 p-4 glass-panel rounded-xl">
                                <div className="flex items-center gap-2 mb-3 text-textMuted text-sm font-medium">
                                    <ShieldCheck size={16} className="text-secondary" /> Verify you are human
                                </div>
                                <Turnstile
                                    siteKey={window.location.hostname === 'localhost' ? '1x00000000000000000000AA' : '0x4AAAAAACoXCJKe8ZVWDkkz'}
                                    onSuccess={(token) => setCaptchaToken(token)}
                                />
                            </div>

                            <form onSubmit={handleEmailPassSignup} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white disabled:opacity-50" disabled={!captchaToken} />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required minLength={6} className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white disabled:opacity-50" disabled={!captchaToken} />
                                </div>

                                <button type="submit" disabled={!captchaToken} className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/30 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Create Account
                                </button>
                            </form>

                            <div className="mt-6">
                                <div className="relative flex items-center py-4">
                                    <div className="flex-grow border-t border-white/10"></div>
                                    <span className="flex-shrink-0 mx-4 text-textMuted text-xs font-medium tracking-wider uppercase">Or via</span>
                                    <div className="flex-grow border-t border-white/10"></div>
                                </div>
                                <button onClick={handleGoogleSignup} disabled={!captchaToken} className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(255,255,255,0.05)]">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                    Google Signup
                                </button>
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
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted mb-2 text-center">Your Profile</h2>
                            <p className="text-textMuted text-center mb-8">Step 2: Choose a Visual Nickname</p>

                            {error && <div className="bg-danger/20 text-red-300 p-3 rounded-xl mb-4 text-sm border border-danger/20">{error}</div>}

                            <form onSubmit={finishRegistration}>
                                <div className="space-y-4 mb-8">
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-5 h-5" />
                                        <input type="text" value={visualNick} onChange={e => setVisualNick(e.target.value)} placeholder="Visual Nickname (e.g. ProServerOwner)" required className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white" />
                                    </div>
                                    <p className="text-xs text-textMuted text-center">This is how you will appear to others on the platform.</p>
                                </div>

                                <button type="submit" className="w-full py-3 rounded-xl bg-primary hover:bg-primaryHover text-white font-semibold shadow-lg shadow-primary/25 transition-all text-lg mb-4">
                                    Finish & Go to Dashboard
                                </button>
                            </form>
                        </motion.div>
                    )}

                </AnimatePresence>

                {step === 1 && (
                    <p className="mt-8 text-center text-textMuted text-sm">
                        Already have an account? <Link to="/login" className="text-white font-semibold hover:text-primary transition-colors underline decoration-white/30 hover:decoration-primary">Log in here</Link>
                    </p>
                )}

            </div>
        </div>
    );
};

export default Register;
