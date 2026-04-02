import { useContext } from "react";
import { NotificationContext } from "@/context/NotificationContext";

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(
        "useNotification must be used within NotificationProvider",
      );
    }
    return null;
  }
  return context;
};

export default useNotification;
