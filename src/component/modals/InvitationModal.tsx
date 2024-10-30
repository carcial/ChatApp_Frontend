import { Button, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../states/Store";
import { closeInvitationModal } from "../../states/InvitationModalSlice";
import { acceptInvitation, refuseInvitation } from "../API";
import { useEffect } from "react";
import useWebSocket from "../useWebSocket";




export default function InvitationModal() {
    const { showInvitationModal, invitationFrom } = useSelector((state: RootState) => state.invitation)
    const { userId } = useSelector((state: RootState) => state.idParam)
    const dispatch: AppDispatch = useDispatch()

    const { connectWebSocket } = useWebSocket()






    const acceptThisInvitation = async (senderId: number) => {
        try {
            const response = await acceptInvitation(userId, senderId)
            console.log(response.data)
        } catch (error) {
            console.log("Could not accept this invitation: ", error)
        }
    }

    const refuseThisInvitation = async (senderId: number) => {
        try {
            const response = await refuseInvitation(senderId, userId)
            console.log(response.data)
        } catch (error) {
            console.error("Could not refuse this invitation: ", error)
        }
    }



    const closeThisModal = () => {
        dispatch(closeInvitationModal())
    }

    useEffect(() => {
        if (userId) {
            connectWebSocket(userId);  // Connect when component mounts
        }
    }, [userId]);

    const filteredInvitations = invitationFrom.filter(user => user.id !== userId)


    return (
        <>
            <Modal show={showInvitationModal} fullscreen={"md-down"} onHide={() => closeThisModal()}>
                <Modal.Header closeButton>
                    <Modal.Title>Received Invitations</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {invitationFrom.length > 0 ? (
                        <div className="invitation-list">
                            {filteredInvitations.map((user) => (
                                <div className="invitation-card" key={user.id}>
                                    <div className="invitation-info">
                                        <h5 className="user-name">{user.userName}</h5>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                    <div className="action-buttons">
                                        <Button variant="success" className="me-2"
                                            onClick={() => acceptThisInvitation(user.id)}>
                                            Accept
                                        </Button>
                                        <Button variant="outline-danger" onClick={() => refuseThisInvitation(user.id)}>
                                            Refuse
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-invitations">No invitations available</p>
                    )}
                </Modal.Body>
            </Modal>

        </>
    )
}
