import { createSlice } from "@reduxjs/toolkit"
import { friendUserDTOType } from "../component/useWebSocket"



export type LoggedUserTypes = {
    id: number,
    profilePic_imageId: number,
    userName: string,
    email: string,
    friends: friendUserDTOType[],
    sendFriendInvitationTO: friendUserDTOType[],
    receiveFriendInvitationFROM: friendUserDTOType[]
}

interface user {
    data: LoggedUserTypes[],
    hasAccount: boolean
}

const initialState: user = {
    data: [],
    hasAccount: false
}

const accountSlice = createSlice({
    name: "usersAccount",
    initialState,
    reducers: {
        loggedUser: (state, action) => {
            state.data = [action.payload]
            state.hasAccount = true
        },
        logoutUser: (state) => {
            state.hasAccount = false
            state.data = []
        }
    }
})

export default accountSlice.reducer
export const { loggedUser, logoutUser } = accountSlice.actions