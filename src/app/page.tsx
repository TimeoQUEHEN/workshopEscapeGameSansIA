'use client'

import React, {useEffect, useState} from "react";
import {useSocket} from "@/hooks/useSocketHooks";
import PageDefaite from "@/app/components/pageDefaite";
import {HAS_ACCESS, Rooms} from "@/game_rooms";
import PageIntro from "@/app/components/pageIntro";

export default function Home() {

    /**
     * Gestion des sockets pour (de)connexion et gestion multijoueurs
     * @see useSocketHooks.tsx
     */
    const { socket, connected } = useSocket();
    const [timeLeft, setTimeLeft] = useState<number>(60 * 60); // 60 minutes en secondes

    /**
     * Gestion de l'inventaire de l'équipe
     * (composant)
     * @see inventaire.tsx
     */
    const [inventory, setInventory] = useState<string[]>([]);

    /**
     * Gestion de la fin de partie (I.E timer = 0)
     * (composant)
     * @see pageDefaite.tsx
     */
    const [gameEnded, setGameEnded] = useState<boolean>(false);

    /**
     * S'active quand la souche du virus est obtenue (I.E Dernière énigme résolue)
     * (composant)
     * @see pageVictoire.tsx
     */
    const [gameWon, setGameWon] = useState<boolean>(false);

    /**
     * Gestion des joueurs connectés (+ présences dans pièces)
     * (composants)
     * @see playerList.tsx
     */
    const [players, setPlayers] = useState<any[]>([]);

    /**
     * Gestion des chats (joueurs + indices)
     * (composants)
     * @see chat.tsx
     */
    const [chatMessages, setChatMessages] = useState<any[]>([]);

    /**
     * Gestion de l'affichage de la salle correspondante
     * le numéro correspond à un switch case qui appellera le composant correspondant
     */
    const [currentRoom, setCurrentRoom] = useState<Rooms>(Rooms.Intro);

    const handleRoomChange = (room : number) => {
        setCurrentRoom(room)
    }

    // Gestion des événements Socket.io
    useEffect(() => {
        if (!socket) return;

        const socketInstance = socket as any;

        socketInstance.on('gameState', (state: any) => {
            setTimeLeft(state.timeLeft);
            setInventory(state.inventory);
            setGameEnded(state.gameEnded);
        });

        socketInstance.on('playersList', (playersList: any) => {
            setPlayers(playersList);
        });

        socketInstance.on('chatMessage', (message: any) => {
            setChatMessages(prev => [...prev, message]);
        });

        socketInstance.on('playerJoined', (player: any) => {
            console.log('Nouveau joueur:', player.name);
        });

        socketInstance.on('playerLeft', (playerId: any) => {
            console.log('Joueur parti:', playerId);
        });

        return () => {
            socketInstance.off('gameState');
            socketInstance.off('playersList');
            socketInstance.off('chatMessage');
            socketInstance.off('playerJoined');
            socketInstance.off('playerLeft');
        };
    }, [socket]);


    if (gameEnded) {
        // Perdu
        return (
            <PageDefaite/>
        )
    }

    if (!HAS_ACCESS) {
        // code de démarrage
        return (
            <PageIntro/>
        )
    }

    if (gameWon) {
        return (
            <PageVictoire/>
        )
    }

    switch (currentRoom) {
        // Hall
        case Rooms.Hall :
            return ( <HallRoom/> )

        // Server
        case Rooms.Server :
            return ( <ServerRoom/> )

        // Labo
        case Rooms.Lab :
            return ( <LabRoom/> )

        // Archives
        case Rooms.Archive :
            return ( <ArchiveRoom/> )

        // Vestiaire
        case Rooms.Vestiaire :
            return ( <ChangingRoom/> )

        case Rooms.Finale :
            return ( <FinalRoom/> )

        // Defaut : Page Entrée
        default :
            return ( <PageIntro/> )
    }
}
