import { create } from "zustand";

// Create a Zustand store for loader state
const useLoaderStore = create((set) => ({
  isLoading: false,
  message: "",
  setLoading: (isLoading, message = "") => set({ isLoading, message }),
}));

// Loader service as a custom hook
export const useLoader = () => {
  const { isLoading, message, setLoading } = useLoaderStore();

  const showLoader = (message = "") => {
    setLoading(true, message);
  };

  const hideLoader = () => {
    setLoading(false, "");
  };

  return {
    isLoading,
    message,
    showLoader,
    hideLoader,
  };
};

export default useLoader;
