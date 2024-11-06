import { Button, ListGroup } from "react-bootstrap";
import { CgProfile } from "react-icons/cg";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../states/Store";
import React, { useState, useEffect, useRef } from "react";
import Login_Register from "./Login_Register";
import { logoutUser } from "../states/AccountSlice";
import { setFriendId, setUserId } from "../states/UserFriendIdSlice ";
import Conversations from "./Conversations";
import { IoArrowBack, IoSearchOutline, IoSettingsOutline } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import { MdAddPhotoAlternate, MdOutlineCancel } from "react-icons/md";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { getUsersForSearchModal, sendMessage } from "./API";
import { getAllUSers, openSearchModal } from "../states/SearchModalSlice";
import SearchModal from "./modals/SearchModal";
import { addNewFriends, openInvitationModal, receiveInvitationFrom } from "../states/InvitationModalSlice";
import InvitationModal from "./modals/InvitationModal";
import { openSettingsModal } from "../states/SettingsModalSlice";
import SettingsModal from "./modals/SettingsModal";
import useWebSocket, { friendUserDTOType } from "./useWebSocket";



type ms = {
    message: string;
    file: File | null;
};

export type searchedUserTypes = {
    id: number,
    userName: string,
    email: string
}

export default function Dashboard() {
    const [seeRegLog, setSeeRegLog] = useState(false);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const { data, hasAccount } = useSelector((state: RootState) => state.usersAccount);
    const { userId, friendId } = useSelector((state: RootState) => state.idParam);
    const { invitationFrom, myFriends } = useSelector((state: RootState) => state.invitation)
    const [inputValue, setInputValue] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const dispatch: AppDispatch = useDispatch();
    const emojiPickerRef = useRef<HTMLDivElement | null>(null);


    const AllFriends = myFriends.filter(
        user => user.id !== userId
    )

    // Use WebSocket hook for real-time messaging
    const { messages: realTimeMessages,
        isConnected,
        disconnectWebSocket,
        sendMessage: sendViaWebSocket,
        connectWebSocket,
        clearMessages } = useWebSocket();





    const count = invitationFrom.filter(user => user.id !== userId).length




    // Initialize WebSocket after login
    useEffect(() => {
        if (userId) {
            //console.log("was at least called from the dashboard tobe")
            connectWebSocket(userId); // Automatically connect after login
        }
        const friendInvitation: friendUserDTOType[] = data[0]?.receiveFriendInvitationFROM || []
        const friends: friendUserDTOType[] = data[0]?.friends || []
        dispatch(receiveInvitationFrom(friendInvitation))
        dispatch(addNewFriends(friends))
    }, [userId]);


    useEffect(() => {
        const handleClickOutside = (event: { target: any; }) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        // Attach the event listener
        document.addEventListener("mousedown", handleClickOutside);

        // Clean up the event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);




    const removeImage = () => {
        setSelectedFile(null)

        // Reset the file input field
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        if (fileInput) {
            fileInput.value = ""; // Clear the input value so that the same file can be selected again
        }
    }


    // Update input and message state
    const getInputValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setSelectedFile(file);
        //console.log("file was selected: ", selectedFile)
    };



    const sendMessageToFriend = async () => {

        const send: ms = { message: inputValue, file: selectedFile || null };

        try {
            await sendMessage(send, userId, friendId);

            if (isConnected) {
                sendViaWebSocket(inputValue, friendId);
                //console.log("was connected in the dashboard")
            } else {
                console.error("WebSocket not connected, but message sent via API.");
            }

            setInputValue(""); // Clear input after sending
            setSelectedFile(null)


        } catch (error) {
            console.error("Could not send the message: ", error);
        }
    };

    const fetchUsersForSearchModal = async () => {
        try {
            const response = await getUsersForSearchModal(userId)
            // console.log("All Users for the search: ", response.data)
            dispatch(getAllUSers(response.data))

        } catch (error) {
            console.error("Could not get the users: ", error)
        }
    }


    // This will help me to auto-hide login/register form after login
    useEffect(() => {
        if (hasAccount) {
            setSeeRegLog(false);
            setSelectedChat(null); // Ensure no chat is selected
        }
    }, [hasAccount]);


    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue((prev) => prev + emojiData.emoji);
    };

    // Set friend ID and select chat
    const chooseFriend = (friend: friendUserDTOType) => {
        dispatch(setUserId(data[0]?.id));
        dispatch(setFriendId(friend.id));
        setSelectedChat(friend.userName);
        clearMessages()
        removeImage()
    };

    const backButton = () => {
        setSelectedChat(null)
        clearMessages()
        removeImage()
    }

    const logOut = () => {
        dispatch(logoutUser())
        disconnectWebSocket()
        window.location.reload()
    }

    const openThisSearchModal = () => {
        dispatch(openSearchModal())
    }

    const openThisInvitationModal = () => {
        dispatch(openInvitationModal())
    }

    const openThisSettingsModal = () => {
        dispatch(openSettingsModal())
    }

    return (
        <div className="dashboard-container">
            <SearchModal />
            <InvitationModal />
            <SettingsModal logOut={logOut} />
            <section className={`left-side ${selectedChat || seeRegLog ? "hide-on-small" : ""}`}>
                <h2 className="text-primary mb-4">CHAPP</h2>

                {!hasAccount ? (
                    <div className="text-center mt-5">
                        <Button variant="primary" onClick={() => setSeeRegLog(true)}>
                            Register/Login
                        </Button>
                        <div className="just-try-section">
                            <span className="section-title">Just Try</span>
                            <div className="test-user">
                                <h6 className="user-title">User 1</h6>
                                <div className="credentials">
                                    <div className="credential">
                                        <label>Email:</label>
                                        <span>Test1@ts.ts</span>
                                    </div>
                                    <div className="credential">
                                        <label>Password:</label>
                                        <span>1234</span>
                                    </div>
                                </div>
                            </div>
                            <div className="test-user">
                                <h6 className="user-title">User 2</h6>
                                <div className="credentials">
                                    <div className="credential">
                                        <label>Email:</label>
                                        <span>Test2@ts.ts</span>
                                    </div>
                                    <div className="credential">
                                        <label>Password:</label>
                                        <span>1234</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    <>
                        <div className="profile-section">
                            <div className="profile-container mb-4">
                                <CgProfile className="profile-icon" />
                                <div className="profile-info">
                                    <h5>{data[0]?.userName}</h5>
                                    <Button variant="outline-primary" className="logout-btn" onClick={() => logOut()}>
                                        Logout
                                    </Button>
                                </div>
                                <IoSettingsOutline className="settings-icon" onClick={() => openThisSettingsModal()} />
                            </div>

                            <div className="invite-friends">
                                <span className="invite-text">Invite new friends</span>
                                <Button className="search-friends-btn"
                                    onClick={() => { openThisSearchModal(); fetchUsersForSearchModal() }}>
                                    <IoSearchOutline className="search-icon" />
                                    Search for friends
                                </Button>
                                <span className="">Received invitations</span>
                                <Button variant="outline-success"
                                    className="d-flex align-items-center"
                                    onClick={() => openThisInvitationModal()}>
                                    Accept invitation
                                    {count > 0 && <span className="invitation-count ms-2">{count}</span>}
                                </Button>
                            </div>



                        </div>


                        <h4 className="text-secondary">Your Friends</h4>
                        <ListGroup className="friend-list">
                            {myFriends.length > 0 ? (
                                AllFriends.map((friend) => (
                                    <ListGroup.Item
                                        key={friend.id}
                                        className={`chat-item ${selectedChat === friend.userName ? 'active' : ''}`}
                                        action
                                        onClick={() => chooseFriend(friend)}
                                    >
                                        <div className="default-avatar">
                                            {friend.userName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="chat-name ms-3">{friend.userName}</div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item>No friends found</ListGroup.Item>
                            )}
                        </ListGroup>

                    </>
                )}
            </section>

            <section className={`right-side ${selectedChat || seeRegLog ? "show-on-small" : ""}`}>
                {!hasAccount && seeRegLog ? (
                    <Login_Register />
                ) : selectedChat ? (
                    <>
                        <div className="chatWith_header">
                            <IoArrowBack className="mt-3" onClick={() => backButton()} />
                            <h3>{selectedChat}</h3>
                        </div>

                        <div className="chat-window">
                            <Conversations realTimeMessages={[...realTimeMessages]} />
                        </div>

                        <div className="sendMessage_container">
                            <input
                                type="file"
                                id="fileInput"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                            {selectedFile &&
                                <div className="image-preview-container">
                                    <div className="image-preview-container">
                                        <img src={URL.createObjectURL(selectedFile)} alt="preview" className="preview-image" />
                                        <MdOutlineCancel className="remove-icon" onClick={removeImage} />
                                    </div>
                                </div>
                            }
                            <MdAddPhotoAlternate onClick={() => document.getElementById('fileInput')?.click()} className="icon" />
                            {/* Emoji Picker Toggle */}
                            <div>
                                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="emoji-button">😊</button>
                                {showEmojiPicker && (
                                    <div className="emoji-picker" ref={emojiPickerRef}>
                                        <EmojiPicker onEmojiClick={onEmojiClick} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Write a message..."
                                value={inputValue}
                                onChange={getInputValue}
                            />
                            <IoIosSend className="send-icon" onClick={sendMessageToFriend} />
                        </div>
                    </>
                ) : (
                    <>
                        {!seeRegLog && hasAccount ?
                            <h3 className="text-center mt-5">Select a chat to start messaging</h3>
                            :
                            <h3 className="text-center mt-5">Please login</h3>
                        }

                    </>
                )}
            </section>
        </div>
    );
}
