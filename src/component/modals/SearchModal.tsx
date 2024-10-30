import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../states/Store";
import { closeSearchModal } from "../../states/SearchModalSlice";
import { IoCheckmarkDone, IoSearchOutline, IoTimeOutline } from "react-icons/io5";
import { useEffect, useState } from "react";
import { searchedUserTypes } from "../Dashboard";
import { sendInvitation } from "../API";
import useWebSocket from "../useWebSocket";





export default function SearchModal() {

    const [searchValue, setSearchValue] = useState<string>("")
    const [searchedUsers, setSearchedUsers] = useState<searchedUserTypes[]>([])
    const { showSearchModal } = useSelector((state: RootState) => state.search)
    const { allUsersForSearchModal } = useSelector((state: RootState) => state.search)
    const { userId } = useSelector((state: RootState) => state.idParam)
    const { invitationTo, invitationFrom, myFriends } = useSelector((state: RootState) => state.invitation)
    const dispatch: AppDispatch = useDispatch()


    const { sendInvitation: invitation, connectWebSocket, isConnected } = useWebSocket()





    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value)
    }


    const sendInvitationTo = async (friendid: number) => {
        try {
            if (!isConnected) {
                connectWebSocket(userId); // Connect WebSocket if not connected
            }

            await sendInvitation(userId, friendid);
            invitation(userId, friendid);
        } catch (error) {
            console.error("Could not invite this user: ", error);
        }
    };


    const searchForFriends = () => {
        if (searchValue !== "") {
            setSearchedUsers(
                allUsersForSearchModal.filter(user => {
                    return user.userName.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()) ||
                        user.email.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())
                })
            )
        }
        else {
            setSearchedUsers([])
        }
    }

    const areFriends = (userId: number) => {
        return myFriends.some(user => user.id === userId);
    };

    const wasInvited = (userId: number) => {
        return invitationTo.some(user => user.id === userId)
    }

    const hasSendInvitationToMe = (userId: number) => {
        return invitationFrom.some(user => user.id === userId)
    }



    const closeThisModal = () => {
        dispatch(closeSearchModal())
        setSearchValue("")
    }

    useEffect(() => {
        searchForFriends()
    }, [searchValue])


    useEffect(() => {
        if (userId) {
            connectWebSocket(userId);  // Connect when component mounts
        }
    }, [userId]);




    return (
        <>
            <Modal
                size="lg"
                show={showSearchModal}
                onHide={() => closeThisModal()}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header closeButton>
                    <InputGroup className="w-100">
                        <Form.Control
                            aria-label="Default"
                            aria-describedby="inputGroup-sizing-default"
                            placeholder="Search for username or email..."
                            onChange={handleOnChange}
                        />
                        <InputGroup.Text id="inputGroup-sizing-default">
                            <IoSearchOutline className="search-icon" />
                        </InputGroup.Text>
                    </InputGroup>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {searchValue ? (
                        <div className="user-list">
                            {searchedUsers.map(user => (
                                <div className="user-card" key={user.id}>
                                    <div className="user-info">
                                        <h5 className="user-name">{user.userName}</h5>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                    <div className="action-buttons">
                                        {areFriends(user.id) ? (
                                            <div className="friend-status">
                                                <IoCheckmarkDone className="friend-check-icon" />
                                                Friend
                                            </div>
                                        ) :
                                            (
                                                hasSendInvitationToMe(user.id) ?
                                                    (<div className="waiting-status">
                                                        <IoTimeOutline className="waiting-icon" />
                                                        Waiting
                                                    </div>)
                                                    :
                                                    (
                                                        wasInvited(user.id) ?
                                                            (<div className="invited-status">Invited</div>)
                                                            :
                                                            (<Button variant="primary"
                                                                className="send-invite-btn"
                                                                onClick={() => sendInvitationTo(user.id)}>
                                                                Send Invitation
                                                            </Button>)
                                                    )
                                            )
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>

                    ) : (
                        <span>No result</span>
                    )}
                </Modal.Body>

            </Modal>

        </>
    )
}
