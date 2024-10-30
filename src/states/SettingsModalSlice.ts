import { createSlice } from "@reduxjs/toolkit"


type SettingsModalType = {
    showSettingsModal: boolean
}

const initialState: SettingsModalType = {
    showSettingsModal: false
}


const settingsModalSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        openSettingsModal: (state) => {
            state.showSettingsModal = true
        },
        closeSettingsModal: (state) => {
            state.showSettingsModal = false
        }
    }
})

export default settingsModalSlice.reducer
export const { openSettingsModal, closeSettingsModal } = settingsModalSlice.actions