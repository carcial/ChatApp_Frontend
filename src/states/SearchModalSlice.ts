import { createSlice } from "@reduxjs/toolkit"
import { searchedUserTypes } from "../component/Dashboard"


type SearchModalType = {
    showSearchModal: boolean,
    allUsersForSearchModal: searchedUserTypes[]
}

const initialState: SearchModalType = {
    showSearchModal: false,
    allUsersForSearchModal: []
}


const searchModalSlice = createSlice({
    name: "seach",
    initialState,
    reducers: {
        openSearchModal: (state) => {
            state.showSearchModal = true
        },
        closeSearchModal: (state) => {
            state.showSearchModal = false
        },
        getAllUSers: (state, action) => {
            state.allUsersForSearchModal = action.payload
        }
    }
})

export default searchModalSlice.reducer
export const { openSearchModal, closeSearchModal, getAllUSers } = searchModalSlice.actions