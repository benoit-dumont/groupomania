import { toast, ToastOptions } from 'vue3-toastify';

const defaultOptions: ToastOptions = {
  // position: toast.POSITION.BOTTOM_RIGHT,
  autoClose: 3000,
};

export function useToast() {
  return {
    success: (msg: string, options?: ToastOptions) =>
      toast.success(msg, { ...defaultOptions, ...options }),
    error: (msg: string, options?: ToastOptions) =>
      toast.error(msg, { ...defaultOptions, ...options }),
    info: (msg: string, options?: ToastOptions) =>
      toast.info(msg, { ...defaultOptions, ...options }),
    warning: (msg: string, options?: ToastOptions) =>
      toast.warning(msg, { ...defaultOptions, ...options }),
    rawToast: toast,
  };
}
