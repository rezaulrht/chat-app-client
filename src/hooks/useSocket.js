import { useContext } from "react";
import { SocketContext } from "@/context/SocketContext";

export const useSocket = () => useContext(SocketContext);
