'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState<boolean>(false);

    useEffect(() => {
        const newSocket = io('http://localhost:3001');

        newSocket.on('connect', () => {
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    return { socket, connected };
};

