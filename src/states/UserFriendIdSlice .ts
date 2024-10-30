import { createSlice } from "@reduxjs/toolkit"


interface apiParamTypes {
    userId: number,
    friendId: number
}

const initialState: apiParamTypes = {
    userId: 0,
    friendId: 0
}


const userFriendIdSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setUserId: (state, action) => {
            state.userId = action.payload
        },
        setFriendId: (state, action) => {
            state.friendId = action.payload
        }
    }
})

export default userFriendIdSlice.reducer
export const { setUserId, setFriendId } = userFriendIdSlice.actions