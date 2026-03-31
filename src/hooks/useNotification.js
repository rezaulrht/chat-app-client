import { useContext } from "react";
import { NotificationContext } from "@/context/NotificationContext";

const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) return null;
  return context;
};

export default useNotification;
