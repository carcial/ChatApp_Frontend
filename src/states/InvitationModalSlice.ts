import { createSlice } from "@reduxjs/toolkit"
import { friendUserDTOType } from "../component/useWebSocket"

type invitationModalType = {
    showInvitationModal: boolean
    invitationFrom: friendUserDTOType[],
    invitationTo: friendUserDTOType[],
    myFriends: friendUserDTOType[]
}

const initialState: invitationModalType = {
    showInvitationModal: false,
    invitationFrom: [],
    invitationTo: [],
    myFriends: []
}


const invitationModalSlice = createSlice({
    name: "invitations",
    initialState,
    reducers: {
        openInvitationModal: (state) => {
            state.showInvitationModal = true
        },
        addNewFriends: (state, action) => {
            state.myFriends = action.payload
        },
        receiveInvitationFrom: (state, action) => {
            // Filter out duplicates before adding to the state
            const newInvitations = action.payload.filter(
                (newInvite: any) => !state.invitationFrom.some(
                    (existingInvite) => existingInvite.id === newInvite.id
                )
            );
            state.invitationFrom = [...state.invitationFrom, ...newInvitations];
        },
        sentInvitations: (state, action) => {
            const newSentInvitations = action.payload.filter(
                (newInvite: any) => !state.invitationTo.some(
                    (existingInvite) => existingInvite.id === newInvite.id
                )
            );
            state.invitationTo = [...state.invitationTo, ...newSentInvitations];

        },
        refuseUserInvitation: (state, action) => {
            state.invitationFrom = state.invitationFrom.filter(
                user => user.id !== action.payload
            )
        },
        removeSentInvitation: (state, action) => {
            state.invitationTo = state.invitationTo.filter(
                user => user.id !== action.payload
            )

            console.log("on ModalSlice InvitationTo:  ", state.invitationTo)
        },
        addSenderAsFriend: (state, action) => {
            if (state.invitationFrom.some(user =>
                user.id === action.payload
            )) {
                const newFriend = state.invitationFrom.filter(
                    user => user.id === action.payload
                )
                state.myFriends = [...state.myFriends, ...newFriend]

                state.invitationFrom = state.invitationFrom.filter(
                    user => user.id !== action.payload
                )
            }
            console.log(`addSenderAsFriend was called 
                \n with friends:  ${state.myFriends} 
                \n invitationFrom: ${state.invitationFrom} 
                \n invitationTo: ${state.invitationTo}`)
        },
        addReceiverAsFriend: (state, action) => {
            if (state.invitationTo.some(user =>
                user.id === action.payload
            )) {
                const newFriend = state.invitationTo.filter(
                    user => user.id === action.payload
                )
                state.myFriends = [...state.myFriends, ...newFriend]

                state.invitationTo = state.invitationTo.filter(
                    user => user.id !== action.payload
                )
            }
            console.log(`addReceiverAsFriend was called 
                \n with friends:  ${state.myFriends} 
                \n invitationFrom: ${state.invitationFrom} 
                \n invitationTo: ${state.invitationTo}`)
        },
        closeInvitationModal: (state) => {
            state.showInvitationModal = false
        }
    }
})

export default invitationModalSlice.reducer
export const {
    openInvitationModal,
    closeInvitationModal,
    receiveInvitationFrom,
    sentInvitations,
    refuseUserInvitation,
    removeSentInvitation,
    addNewFriends,
    addReceiverAsFriend,
    addSenderAsFriend
} = invitationModalSlice.actions
