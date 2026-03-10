import { useState, useRef } from 'react';
import { Settings as SettingsIcon, Volume2, Monitor, Ear, Smartphone, User as UserIcon, Loader2, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { userService } from '../../services/userService';
import { auth } from '../../lib/firebase/init';
import { RecaptchaVerifier, linkWithPhoneNumber, unlink } from 'firebase/auth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { motion } from 'framer-motion';
import { getFriendlyAuthError } from '../../utils/authErrors';
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const { user, visualNick } = useAuthStore();
    const { volume, setVolume, colorblindMode, setColorblindMode, voiceoverEnabled, setVoiceover, theme, setTheme, language, setLanguage } = useUIStore();

    const [nickInput, setNickInput] = useState(visualNick || '');
    const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [isSavingPref, setIsSavingPref] = useState(false);
    const [isLinkingPhone, setIsLinkingPhone] = useState(false);
    const volumeRef = useRef(volume);

    const savePreference = async (key: string, value: any) => {
        if (!user) return;
        setIsSavingPref(true);
        try {
            await userService.updatePreferences(user.uid, { [key]: value });
        } catch (e) {
            Toast.error(`Failed to sync ${key}`);
        } finally {
            setIsSavingPref(false);
        }
    };

    const handleVolumeChange = (newVol: number) => {
        setVolume(newVol);
        volumeRef.current = newVol;
    };

    const handleVolumeSave = () => {
        savePreference('volume', volumeRef.current);
    };

    const toggleColorblind = () => {
        const next = !colorblindMode;
        setColorblindMode(next);
        savePreference('colorblindMode', next);
    };

    const toggleVoice = () => {
        const next = !voiceoverEnabled;
        setVoiceover(next);
        savePreference('voiceoverEnabled', next);
    };

    const handleThemeChange = (newTheme: 'dark' | 'light') => {
        setTheme(newTheme);
        savePreference('theme', newTheme);
    };

    const handleLanguageChange = (lang: 'en' | 'ru') => {
        setLanguage(lang);
        i18n.changeLanguage(lang);
        savePreference('language', lang);
    };

    const handleNickSave = async () => {
        if (!user || !nickInput || nickInput === visualNick) return;
        Toast.promise(
            userService.claimUsername(nickInput, user.uid),
            {
                loading: 'Updating display name...',
                success: 'Display name updated! (if available)',
                error: 'Failed to update name.'
            }
        );
    };

    const handlePhoneLink = async () => {
        if (!user || !phoneInput) return;
        setIsLinkingPhone(true);
        try {
            if (!(window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'link-recaptcha', { size: 'invisible' });
            }
            const confirmationResult = await linkWithPhoneNumber(user, phoneInput, (window as any).recaptchaVerifier);
            (window as any).linkConfirmationResult = confirmationResult;
            setShowOtp(true);
            Toast.success('OTP sent');
        } catch (e: any) {
            Toast.error(getFriendlyAuthError(e.code || e.message));
            if ((window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier.clear();
                (window as any).recaptchaVerifier = null;
            }
        } finally {
            setIsLinkingPhone(false);
        }
    };

    const confirmPhoneLink = async () => {
        if (!user || !otp) return;
        setIsLinkingPhone(true);
        try {
            const cred = await (window as any).linkConfirmationResult.confirm(otp);
            await userService.updateUser(user.uid, { phoneNumber: cred.user.phoneNumber });
            Toast.success('Phone linked successfully!');
            setShowOtp(false);
            setOtp('');
        } catch (e: any) {
            Toast.error(getFriendlyAuthError(e.code || e.message));
        } finally {
            setIsLinkingPhone(false);
        }
    };

    const handlePhoneUnlink = async () => {
        if (!user) return;
        setIsLinkingPhone(true);
        try {
            await unlink(user, 'phone');
            await userService.updateUser(user.uid, { phoneNumber: null as any });
            setPhoneInput('');
            Toast.success('Phone unlinked successfully');
        } catch (e: any) {
            Toast.error(getFriendlyAuthError(e.code || e.message));
        } finally {
            setIsLinkingPhone(false);
        }
    };

    return (
        <div className="flex-1 max-w-5xl mx-auto px-6 md:px-12 py-12 w-full">
            <div className="mb-8 border-b border-border pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <SettingsIcon className="text-primary w-8 h-8" /> {t('Preferences')}
                    </h1>
                    <p className="text-muted-foreground text-sm">{t('Customize your hosting experience')} {isSavingPref && <span className="text-primary ml-2 animate-pulse">Syncing...</span>}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">

                {/* Visual Settings */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <Card className="p-8 h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Monitor className="text-primary w-5 h-5" />
                            <h3 className="text-lg font-bold text-foreground">{t('Appearance')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-foreground mb-3 block">{t('Dashboard Theme')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => handleThemeChange('dark')}
                                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-[hsl(240,10%,4%)] border border-border" />
                                        <span className="text-sm font-bold">{t('Dark Mode')}</span>
                                    </div>
                                    <div
                                        onClick={() => handleThemeChange('light')}
                                        className={`p-4 rounded-lg border flex flex-col items-center gap-2 cursor-pointer transition-all ${theme === 'light' ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white border border-border" />
                                        <span className="text-sm font-bold">{t('Light Mode')}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-foreground mb-1 block">{t('Panel Language')}</label>
                                <p className="text-xs text-muted-foreground mb-3">{t('Choose the default language for the interface.')}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleLanguageChange('en')}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${language === 'en' ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground'}`}
                                    >
                                        English (US)
                                    </button>
                                    <button
                                        onClick={() => handleLanguageChange('ru')}
                                        className={`p-3 rounded-lg border text-sm font-medium transition-all ${language === 'ru' ? 'border-primary bg-primary/10 text-foreground' : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground'}`}
                                    >
                                        Русский
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Accessibility Settings */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <Card className="p-8 h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Ear className="text-primary w-5 h-5" />
                            <h3 className="text-lg font-bold text-foreground">{t('Accessibility')}</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-foreground flex items-center gap-2"><Volume2 size={16} /> {t('Interface Volume')}</label>
                                    <span className="text-xs text-primary font-mono">{volume}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={volume}
                                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                    onMouseUp={handleVolumeSave}
                                    onTouchEnd={handleVolumeSave}
                                    className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <div
                                onClick={toggleColorblind}
                                className="flex items-start justify-between p-4 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-all select-none"
                            >
                                <div>
                                    <p className="text-sm font-bold text-foreground">{t('Colorblind Mode')}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Enhances contrast and changes status indicators.</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full shrink-0 transition-colors relative ${colorblindMode ? 'bg-primary' : 'bg-muted border border-border'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${colorblindMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                            </div>

                            <div
                                onClick={toggleVoice}
                                className="flex items-start justify-between p-4 bg-surface rounded-lg border border-border cursor-pointer hover:border-primary/50 transition-all select-none"
                            >
                                <div>
                                    <p className="text-sm font-bold text-foreground">{t('Site Navigator (Voiceover)')}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Enables experimental text-to-speech for critical alerts.</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full shrink-0 transition-colors relative ${voiceoverEnabled ? 'bg-primary' : 'bg-muted border border-border'}`}>
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform ${voiceoverEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Account Management */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="md:col-span-2">
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <UserIcon className="text-primary w-5 h-5" />
                            <h3 className="text-lg font-bold text-foreground">{t('Account Management')}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground">{t('Public Display Name')}</label>
                                <p className="text-xs text-muted-foreground">{t('This name is visible to members invited to your servers.')}</p>
                                <div className="flex gap-2">
                                    <Input
                                        icon={<UserIcon size={16} />}
                                        value={nickInput}
                                        onChange={(e) => setNickInput(e.target.value)}
                                        placeholder="MaxenUser123"
                                        className="flex-1"
                                    />
                                    <Button onClick={handleNickSave} disabled={nickInput === visualNick || !nickInput}>{t('Save')}</Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground">{t('Link Phone Number')}</label>
                                <p className="text-xs text-muted-foreground">{t('Used for SMS 2FA and identity verification.')}</p>

                                {user?.phoneNumber ? (
                                    <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="text-secondary w-5 h-5" />
                                            <div>
                                                <p className="text-sm font-bold text-secondary">{t('Phone Linked')}</p>
                                                <p className="text-xs text-secondary/80">{user.phoneNumber}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="border-danger/30 text-danger hover:bg-danger/10 hover:text-danger" onClick={handlePhoneUnlink} disabled={isLinkingPhone}>
                                            {isLinkingPhone ? <Loader2 className="animate-spin w-4 h-4" /> : t('Unlink')}
                                        </Button>
                                    </div>
                                ) : !showOtp ? (
                                    <div className="flex gap-2">
                                        <Input
                                            type="tel"
                                            icon={<Smartphone size={16} />}
                                            value={phoneInput}
                                            onChange={(e) => setPhoneInput(e.target.value)}
                                            placeholder="+1 (555) 000-0000"
                                            className="flex-1"
                                            disabled={isLinkingPhone}
                                        />
                                        <Button variant="outline" onClick={handlePhoneLink} disabled={!phoneInput || isLinkingPhone}>
                                            {isLinkingPhone ? <Loader2 className="animate-spin w-4 h-4" /> : t('Link')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                className="flex-1 text-center tracking-widest font-mono"
                                                disabled={isLinkingPhone}
                                            />
                                            <Button onClick={confirmPhoneLink} disabled={!otp || isLinkingPhone}>
                                                {isLinkingPhone ? <Loader2 className="animate-spin w-4 h-4" /> : t('Verify')}
                                            </Button>
                                        </div>
                                        <button onClick={() => setShowOtp(false)} className="text-xs text-muted-foreground hover:text-foreground text-left transition-colors font-medium">{t('Cancel setup')}</button>
                                    </div>
                                )}
                                <div id="link-recaptcha"></div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground">{t('Two-Factor Authentication')}</label>
                                <p className="text-xs text-muted-foreground">{t('Add an extra layer of security to your account.')}</p>
                                <div className="flex items-center justify-between p-3 bg-surface border border-border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                            <ShieldCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{t('App Authenticator')}</p>
                                            <p className="text-xs text-muted-foreground">{t('Not configured')}</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => Toast.success(t('2FA setup dialog opened'))} variant="outline" size="sm">{t('Setup 2FA')}</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
};

export default Settings;
