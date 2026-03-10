import toast from 'react-hot-toast';

// A wrapper around react-hot-toast to provide a consistent API and custom 
// designed toasts that fit the Maxen Design System beyond the global Toaster settings.

export const Toast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    loading: (message: string) => toast.loading(message),
    dismiss: (toastId?: string) => toast.dismiss(toastId),

    // Custom styled toast example
    promise: <T>(
        promise: Promise<T>,
        msgs: { loading: string; success: string; error: string }
    ) => toast.promise(promise, msgs)
};

export default Toast;
