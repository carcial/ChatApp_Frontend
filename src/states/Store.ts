import { configureStore } from "@reduxjs/toolkit";
import AccountSlice from "./AccountSlice";
import userFriendIdSlice from "./UserFriendIdSlice "
import SearchModalSlice from "./SearchModalSlice";
import InvitationModalSlice from "./InvitationModalSlice";
import SettingsModalSlice from "./SettingsModalSlice";

const store = configureStore({
    reducer: {
        usersAccount: AccountSlice,
        idParam: userFriendIdSlice,
        search: SearchModalSlice,
        invitation: InvitationModalSlice,
        settings: SettingsModalSlice,


    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store