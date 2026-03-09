import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
    en: {
        translation: {
            "Welcome Back": "Welcome Back",
            "Access your premium Maxen servers": "Access your premium Maxen servers",
            "Email": "Email",
            "Passwordless": "Passwordless",
            "Phone": "Phone",
            "Sign In": "Sign In",
            "Send Magic Link": "Send Magic Link",
            "Send OTP": "Send OTP",
            "Verify OTP": "Verify OTP",
            "Google Signup": "Google Signup"
        }
    },
    ru: {
        translation: {
            "Welcome Back": "С возвращением",
            "Access your premium Maxen servers": "Получите доступ к вашим премиум серверам Maxen",
            "Email": "Email",
            "Passwordless": "Без пароля",
            "Phone": "Телефон",
            "Sign In": "Войти",
            "Send Magic Link": "Отправить ссылку",
            "Send OTP": "Отправить код",
            "Verify OTP": "Проверить код",
            "Google Signup": "Вход через Google"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
