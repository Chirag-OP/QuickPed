import { toast } from 'sonner';

export const adminToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
  loading: (message: string) => toast.loading(message),
  dismiss: (id?: string | number) => toast.dismiss(id),
};

export const runWithFeedback = async <T>(
  action: () => Promise<T> | T,
  messages: { loading: string; success: string; error?: string }
): Promise<T | null> => {
  const toastId = adminToast.loading(messages.loading);
  try {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const result = await action();
    adminToast.dismiss(toastId);
    adminToast.success(messages.success);
    return result;
  } catch (error) {
    adminToast.dismiss(toastId);
    adminToast.error(messages.error ?? (error instanceof Error ? error.message : 'Something went wrong'));
    return null;
  }
};
