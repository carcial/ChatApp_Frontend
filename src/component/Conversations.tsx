import { useEffect, useState, useRef } from "react";
import { RootState } from "../states/Store";
import { useSelector } from "react-redux";
import { API_URL, getConversation } from "./API";
import { ListGroup } from "react-bootstrap";

// Types
type senderReceiverType = {
    id: number;
    userName: string;
};

export type messageType = {
    messageId: number;
    senderId: number;
    imageId: number;
    message: string;
    sendingTime: string;
};

interface userChat {
    chatId: number;
    sender: senderReceiverType;
    receiver: senderReceiverType;
    messages: messageType;  // Single message object
}

interface ConversationsProps {
    realTimeMessages: messageType[]; // Real-time messages passed as props
}

export default function Conversations({ realTimeMessages }: ConversationsProps) {
    const [chatList, setChatList] = useState<userChat[]>([]);
    const { userId, friendId } = useSelector((state: RootState) => state.idParam);
    const [images, setImages] = useState<{ [key: number]: string }>({}); // Store image URLs by imageId

    // Create a ref to track the last message
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Fetch the conversation history
    const fetchConversation = async () => {
        try {
            const response = await getConversation(userId, friendId);
            const allReceivedMessages = response.data.sort((a: { chatId: number; }, b: { chatId: number; }) => a.chatId - b.chatId);
            setChatList(allReceivedMessages);  // Set the conversation history

            // Fetch images for each message with an imageId > 0
            allReceivedMessages.forEach((chat: userChat) => {
                if (chat.messages.imageId > 0) {
                    fetchImage(chat.messages.imageId);
                }
            });
        } catch (error) {
            console.error("Could not get the Conversations: ", error);
        }
    };

    // Function to fetch images for real-time messages
    const fetchRealTimeImages = async () => {
        const newMessagesWithImages = realTimeMessages.filter(
            (msg) => msg.imageId > 0 && !images[msg.imageId]
        );

        for (const msg of newMessagesWithImages) {
            await fetchImage(msg.imageId);
        }
    };

    // Fetch images when new real-time messages arrive
    useEffect(() => {
        fetchRealTimeImages();
    }, [realTimeMessages]);

    const fetchImage = async (chatImageId: number) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/user/getAnImage/${chatImageId}`);
            if (response.ok) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                setImages((prevImages) => ({ ...prevImages, [chatImageId]: imageUrl })); // Store image URL
            }
        } catch (error) {
            console.error("Could not fetch the Image: ", error);
        }
    };

    useEffect(() => {
        if (userId && friendId) {
            fetchConversation();
        }
    }, [userId, friendId]);

    // Filter real-time messages so they only show messages from/to the current friend
    const filteredRealTimeMessages = realTimeMessages.filter(
        (msg) => msg.senderId === friendId || msg.senderId === userId
    );

    // Merge the conversation history with filtered real-time messages
    const allMessages = [
        ...chatList.map(chat => ({
            message: chat.messages.message,
            sendingTime: chat.messages.sendingTime,
            senderId: chat.sender.id,
            messageId: chat.messages.messageId,
            imageId: chat.messages.imageId
        })),
        ...filteredRealTimeMessages.map(msg => ({
            message: msg.message,
            sendingTime: msg.sendingTime,
            senderId: msg.senderId,
            messageId: msg.messageId,
            imageId: msg.imageId
        }))
    ];


    // Scroll to the bottom of the messages container when new messages arrive
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Auto scroll to the latest message on every render and when new messages are received
    useEffect(() => {
        scrollToBottom();
    }, [allMessages]);

    return (
        <div className="conversation-container">
            <ListGroup className="chat-list">
                {allMessages.length > 0 ? (
                    allMessages.map((msg, index) => (
                        <div key={`${msg.messageId}-${index}`} className={`chat-message ${msg.senderId === userId ? "right_message" : "left_message"}`}>
                            {msg.message && (
                                <div className="message-content">{msg.message}</div>
                            )}
                            {msg.imageId > 0 && images[msg.imageId] && (
                                <div className="message-image">
                                    <img src={images[msg.imageId]} alt="Message attachment" />
                                </div>
                            )}
                            <div className="message-time">{msg.sendingTime}</div>
                        </div>
                    ))
                ) : (
                    <div className="text-center">No messages yet.</div>
                )}
                {/* This div will always be at the bottom of the chat and will be scrolled into view */}
                <div ref={messagesEndRef} />
            </ListGroup>
        </div>
    );
}
