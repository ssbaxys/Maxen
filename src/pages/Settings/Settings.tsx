import { useState } from 'react';
import { Settings as SettingsIcon, Volume2, Monitor, Ear, Smartphone, User as UserIcon, Loader2 } from 'lucide-react';
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

const Settings = () => {
    const { user, visualNick } = useAuthStore();
    const { volume, setVolume, colorblindMode, setColorblindMode, voiceoverEnabled, setVoiceover, theme, setTheme } = useUIStore();

    // Local state for forms
    const [nickInput, setNickInput] = useState(visualNick || '');
    const [phoneInput, setPhoneInput] = useState(user?.phoneNumber || '');
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [isSavingPref, setIsSavingPref] = useState(false);
    const [isLinkingPhone, setIsLinkingPhone] = useState(false);

    // Sync UI store changes to Firebase when they happen
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
        // Debounce actual DB save for sliders in a real app, mock immediate here
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
                        <SettingsIcon className="text-primary w-8 h-8" /> Preferences
                    </h1>
                    <p className="text-muted-foreground text-sm">Customize your hosting experience {isSavingPref && <span className="text-primary ml-2 animate-pulse">Syncing...</span>}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">

                {/* Visual Settings */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <Card className="p-8 h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Monitor className="text-primary w-5 h-5" />
                            <h3 className="text-lg font-bold text-foreground">Appearance</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-foreground mb-3 block">Dashboard Theme</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        onClick={() => handleThemeChange('dark')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-background border border-border" />
                                        <span className="text-sm font-bold">Dark Mode</span>
                                    </div>
                                    <div
                                        onClick={() => handleThemeChange('light')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-all ${theme === 'light' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface hover:bg-surface-hover text-muted-foreground'}`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-white border border-border" />
                                        <span className="text-sm font-bold">Light Mode</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-foreground mb-1 block">Panel Language</label>
                                <p className="text-xs text-muted-foreground mb-3">Choose the default language for the interface.</p>
                                <select className="w-full bg-surface/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-sm text-foreground appearance-none">
                                    <option value="en">English (US)</option>
                                    <option value="ru">Русский (Russian)</option>
                                    <option value="de">Deutsch (German)</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Accessibility Settings */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
                    <Card className="p-8 h-full">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                            <Ear className="text-primary w-5 h-5" />
                            <h3 className="text-lg font-bold text-foreground">Accessibility</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-foreground flex items-center gap-2"><Volume2 size={16} /> Interface Volume</label>
                                    <span className="text-xs text-primary font-mono">{volume}%</span>
                                </div>
                                <input
                                    type="range" min="0" max="100"
                                    value={volume}
                                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                                    onMouseUp={() => savePreference('volume', volume)}
                                    className="w-full accent-primary h-2 bg-surface rounded-lg appearance-none cursor-pointer"
                                />
                                <p className="text-xs text-muted-foreground mt-2">Adjusts the volume of notification pings and console alerts.</p>
                            </div>

                            <div
                                onClick={toggleColorblind}
                                className="flex items-start justify-between p-4 bg-surface rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all select-none"
                            >
                                <div>
                                    <p className="text-sm font-bold text-foreground">Colorblind Mode</p>
                                    <p className="text-xs text-muted-foreground mt-1">Enhances contrast and changes status indicators from Green/Red to Blue/Orange (Protanopia focus).</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full shrink-0 transition-colors relative ${colorblindMode ? 'bg-primary' : 'bg-surface-hover border border-border'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${colorblindMode ? 'translate-x-7' : 'translate-x-1'}`} />
                                </div>
                            </div>

                            <div
                                onClick={toggleVoice}
                                className="flex items-start justify-between p-4 bg-surface rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all select-none"
                            >
                                <div>
                                    <p className="text-sm font-bold text-foreground">Site Navigator (Voiceover)</p>
                                    <p className="text-xs text-muted-foreground mt-1">Enables experimental text-to-speech for critical alerts and panel state changes.</p>
                                </div>
                                <div className={`w-12 h-6 rounded-full shrink-0 transition-colors relative ${voiceoverEnabled ? 'bg-primary' : 'bg-surface-hover border border-border'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${voiceoverEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
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
                            <h3 className="text-lg font-bold text-foreground">Account Management</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground">Public Display Name</label>
                                <p className="text-xs text-muted-foreground">This name is visible to members invited to your servers.</p>
                                <div className="flex gap-2">
                                    <Input
                                        icon={<UserIcon size={16} />}
                                        value={nickInput}
                                        onChange={(e) => setNickInput(e.target.value)}
                                        placeholder="MaxenUser123"
                                        className="flex-1"
                                    />
                                    <Button onClick={handleNickSave} disabled={nickInput === visualNick || !nickInput}>Save</Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-foreground">Link Phone Number</label>
                                <p className="text-xs text-muted-foreground">Used for SMS 2FA and identity verification.</p>

                                {user?.phoneNumber ? (
                                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Smartphone className="text-emerald-500 w-5 h-5" />
                                            <div>
                                                <p className="text-sm font-bold text-emerald-500">Phone Linked</p>
                                                <p className="text-xs text-emerald-500/80">{user.phoneNumber}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="border-danger/30 text-danger hover:bg-danger/10 hover:text-danger" onClick={handlePhoneUnlink} disabled={isLinkingPhone}>
                                            {isLinkingPhone ? <Loader2 className="animate-spin w-4 h-4" /> : 'Unlink'}
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
                                            {isLinkingPhone ? <Loader2 className="animate-spin w-4 h-4" /> : 'Link'}
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
                                            <Button variant="outline" className="bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-white" onClick={confirmPhoneLink} disabled={!otp || isLinkingPhone}>
                                                {isLinkingPhone ? <Loader2 className="animate-spin w-4 h-4" /> : 'Verify'}
                                            </Button>
                                        </div>
                                        <button onClick={() => setShowOtp(false)} className="text-xs text-muted-foreground hover:text-foreground text-left transition-colors font-medium">Cancel setup</button>
                                    </div>
                                )}
                                <div id="link-recaptcha"></div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
};

export default Settings;
