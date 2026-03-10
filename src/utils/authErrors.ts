export const getFriendlyAuthError = (errorCode: string): string => {
    switch (errorCode) {
        // Common Email/Password Errors
        case 'auth/invalid-email':
            return 'Invalid email address format. (Неверный формат эл. почты)';
        case 'auth/user-disabled':
            return 'This account has been disabled. (Аккаунт заблокирован)';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password. (Неверный email или пароль)';
        case 'auth/email-already-in-use':
            return 'This email is already registered. (Этот email уже зарегистрирован)';
        case 'auth/weak-password':
            return 'Password is too weak. Must be at least 6 characters. (Слишком слабый пароль)';

        // Link Errors
        case 'auth/invalid-action-code':
            return 'The magic link is invalid or has expired. (Ссылка недействительна или устарела)';

        // Phone Auth Errors
        case 'auth/invalid-phone-number':
            return 'Invalid phone number format. Please include country code (+1...). (Неверный формат номера)';
        case 'auth/missing-phone-number':
            return 'Please provide a phone number. (Введите номер телефона)';
        case 'auth/quota-exceeded':
            return 'SMS quota exceeded. Please try again later. (Превышен лимит SMS. Попробуйте позже)';
        case 'auth/invalid-verification-code':
            return 'Invalid or expired OTP code. (Неверный или устаревший код)';

        // Security Errors
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later. (Слишком много попыток. Попробуйте позже)';

        // Linking / Providers
        case 'auth/provider-already-linked':
            return 'This provider is already linked to your account. (Этот способ входа уже привязан)';
        case 'auth/credential-already-in-use':
            return 'This credential is already linked to another account. (Эти данные уже используются другим аккаунтом)';

        default:
            return 'An unexpected error occurred. Please try again. (Произошла неизвестная ошибка)';
    }
};
