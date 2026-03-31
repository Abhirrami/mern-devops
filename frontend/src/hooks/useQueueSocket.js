import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

function useQueueSocket({ doctorId, date, onQueueUpdate }) {
  const callbackRef = useRef(onQueueUpdate);

  useEffect(() => {
    callbackRef.current = onQueueUpdate;
  }, [onQueueUpdate]);

  useEffect(() => {
    if (!doctorId || !date) {
      return undefined;
    }

    const socket = io(socketUrl, {
      transports: ["websocket"]
    });

    socket.emit("queue:join", { doctorId, date });
    socket.on("queue:update", (payload) => callbackRef.current(payload));

    return () => {
      socket.emit("queue:leave", { doctorId, date });
      socket.disconnect();
    };
  }, [doctorId, date]);
}

export default useQueueSocket;
