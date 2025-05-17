import { ToastContent, ToastOptions, UpdateOptions, toast } from "react-toastify";
import { IDialogToast } from "./interface";

export enum TOAST_ID {
  ERROR = 5,
  PROCESS = 2,
  SUCCESS = 3,
  INFO = 2,
  DIALOG = 7,
}

export const toastError = (textData: ToastContent<unknown>, options?: ToastOptions<unknown> | undefined) =>
  toast.error(textData, {
    position: "top-right",
    toastId: TOAST_ID.ERROR,
    autoClose: 7000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });

export const toastProcess = (textData: ToastContent<unknown>, options?: ToastOptions<unknown> | undefined) =>
  toast.info(textData, {
    toastId: TOAST_ID.PROCESS,
    autoClose: 5000,
    position: "top-right",
    hideProgressBar: true,
    closeOnClick: true,
    draggable: true,
    isLoading: true,
    progress: undefined,
    ...options,
  });

export const toastInfo = (textData: ToastContent<unknown>, options?: ToastOptions<unknown> | undefined) =>
  toast.info(textData, {
    toastId: TOAST_ID.INFO,
    autoClose: 5000,
    position: "top-right",
    hideProgressBar: true,
    closeOnClick: true,
    draggable: true,
    progress: undefined,
    ...options,
  });

export const toastSuccess = (textData: ToastContent<unknown>, options?: ToastOptions<unknown> | undefined) =>
  toast.success(textData, {
    position: "top-right",
    toastId: TOAST_ID.SUCCESS,
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    ...options,
  });

export const toastDialog = (reactNode: React.ReactNode, options: ToastOptions<unknown> & IDialogToast) =>
  toast.info(reactNode, {
    toastId: TOAST_ID.DIALOG,
    position: "top-right",
    hideProgressBar: true,
    icon: false,
    autoClose: false,
    closeButton: false,
    draggable: false,
    closeOnClick: false,
    ...options,
  });

export const toastUpdate = (toastID: TOAST_ID, options?: UpdateOptions<unknown> | undefined) => {
  toast.update(toastID, {
    autoClose: 3000,
    isLoading: false,
    ...options,
  });
};

export const toastDismiss = (toastID: TOAST_ID) => toast.dismiss(toastID);
