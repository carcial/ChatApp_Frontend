import { useState, useCallback, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { AppDispatch } from "../states/Store";
import { useDispatch } from "react-redux";
import { addReceiverAsFriend, addSenderAsFriend, receiveInvitationFrom, refuseUserInvitation, removeSentInvitation, sentInvitations } from "../states/InvitationModalSlice";
import { messageType } from "./Conversations";



export interface Message {
    chatId: number;
    senderId: number;
    message: string;
    sendingTime: string
}
export interface friendUserDTOType {
    id: number;
    userName: string;
    email: string
}


const useWebSocket = () => {
    const [messages, setMessages] = useState<messageType[]>([]);
    const client = useRef<Client | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const dispatch: AppDispatch = useDispatch()


    const connectWebSocket = useCallback((userId: number) => {
        if (client.current) {
            //console.log("WebSocket already connected");
            return;
        }

        // Use ws:// instead of SockJS for WebSocket URL
        const stompClient = new Client({
            brokerURL: `wss://chatappbackend-production-81cf.up.railway.app/ws`,  // Use native WebSocket
            reconnectDelay: 5000, // Attempt to reconnect
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });



        stompClient.onConnect = () => {
            setIsConnected(true);
            // console.log("WebSocket connected for userId: ", userId);

            // Now subscribe only after the WebSocket connection is established
            stompClient.subscribe(`/user/${userId}/start/chat`, (message) => {
                const receivedData = JSON.parse(message.body); // Assuming backend sends JSON
                const { messageId,
                    senderId,
                    imageId,
                    message: receivedMessage,
                    sendingTime } = receivedData;

                //console.log(`Private message received for userId ${userId}, from senderId ${senderId}: ${receivedMessage}`);

                setMessages((prevMessages) =>
                    [...prevMessages,
                    {
                        messageId,
                        senderId,
                        imageId,
                        message: receivedMessage,
                        sendingTime
                    }]);
            });

            stompClient.subscribe(`/user/${userId}/start/invite`, (payload) => {

                const receivedData = JSON.parse(payload.body);
                const { sender, receiver } = receivedData;

                //console.log(`Current invitations: Sender ID: ${sender.id}, Receiver ID: ${receiver.id}`);

                dispatch(receiveInvitationFrom([sender]))
                dispatch(sentInvitations([receiver]))

            });

            stompClient.subscribe(`/user/${userId}/start/refuse`, (payload) => {
                //console.log("refuse invitation on real-time was called")
                //console.log("refusal payload: ", payload.body)

                const receivedData = JSON.parse(payload.body)

                //console.log(`refused data received. \n sender: ${receivedData[0]} \n receiver: ${receivedData[1]}`)

                dispatch(refuseUserInvitation(receivedData[0]))
                dispatch(removeSentInvitation(receivedData[1]))
            })

            stompClient.subscribe(`/user/${userId}/start/accept`, (payload) => {
                //console.log("accept invitation on real-time was called")

                const receivedData = JSON.parse(payload.body)

                dispatch(addSenderAsFriend(receivedData[0]))
                dispatch(addReceiverAsFriend(receivedData[1]))
            })

        };

        stompClient.onDisconnect = () => {
            setIsConnected(false);
            //console.log("WebSocket disconnected");
        };

        stompClient.activate();
        client.current = stompClient;
    }, []);

    const disconnectWebSocket = () => {
        if (client.current) {
            client.current.deactivate();
            client.current = null;
            //console.log("WebSocket disconnected by user");
        }
    };

    const sendMessage = (message: string, friendId: number) => {
        if (isConnected && client.current) {
            client.current.publish({
                destination: `/current/chat/${friendId}`,
                body: message,
            });
            //console.log(`Sent message to friendId ${friendId}: ${message}`);
        }
    };

    const sendInvitation = (userId: number, friendId: number) => {
        console.log("sendInvitation was called")
        if (isConnected && client.current) {
            console.log("sendInvitation was called 2")
            client.current.publish({
                destination: `/current/invite/${friendId}`,
                body: JSON.stringify({
                    senderId: userId,
                    receiverId: friendId
                })
            });
            // console.log(`Invitation sent to friendId ${friendId}`);
        }
    };


    const clearMessages = () => {
        setMessages([]);  // Clear real-time messages
    };

    return { messages, sendMessage, sendInvitation, clearMessages, connectWebSocket, disconnectWebSocket, isConnected };
};

export default useWebSocket;
