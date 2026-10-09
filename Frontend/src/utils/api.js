import axios from "axios";
import { toast } from "sonner";
import { setUser } from "@/redux/authSlice";

// Global axios setup, called once from main.jsx.
export const setupApi = (store) => {
  // the auth cookie must be sent with every API call
  axios.defaults.withCredentials = true;

  // If the server says we're not logged in (cookie expired, secret rotated, user deleted)
  // while the app still thinks we are, clear the stale user and send them to login.
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const hadUser = Boolean(store.getState().auth.user);
      const isLoginCall = error.config?.url?.includes("/user/login");
      if (status === 401 && hadUser && !isLoginCall) {
        store.dispatch(setUser(null));
        toast.error("Your session has expired, please login again");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign("/login");
        }
      }
      return Promise.reject(error);
    },
  );
};
