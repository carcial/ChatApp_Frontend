import axios from "axios";






const API_URL = 'http://localhost:8080/api/v1';

export const registerUser = (userData: any) => {
    return axios.post(`${API_URL}/user/register`, userData);
};

export const loginUser = (loginData: any) => {
    return axios.post(`${API_URL}/user/login`, loginData, {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true,  // Send credentials (if you use session or cookies-based authentication)
    });
};

export const updateUser = (id: number, userName: string, email: string, password: string) => {
    return axios.put(`${API_URL}/user/updateUserInfos/${id}`, null, {
        params: {
            newUserName: userName,
            newEmail: email,
            newPassword: password,
        },
    });
};

export const sendMessage = (messageData: { message: string, file: File | null }, senderId: number, receiverId: number) => {
    const formData = new FormData();

    // Append the message
    formData.append("message", messageData.message);

    // Append the file if it's not null
    if (messageData.file) {
        formData.append("file", messageData.file);
    } else {
        formData.append("file", new Blob([]), "");  // Append an empty file which will help me overcome the "401 unauthorized" 
    }

    return axios.post(`${API_URL}/chats/sendMessage/${senderId}/${receiverId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',  // Ensure this header is set
        },
        withCredentials: false  // No credentials needed for this request
    });
};

export const getConversation = (senderId: number, receiverId: number) => {
    return axios.get(`${API_URL}/chats/conversation/${senderId}/${receiverId}`);
};

export const sendInvitation = (senderId: number, receiverId: number) => {
    return axios.patch(`${API_URL}/user/invitation/${senderId}/${receiverId}`)
}

export const acceptInvitation = (userId: number, invitationId: number) => {
    return axios.patch(`${API_URL}/user/acceptInvitation/${userId}/${invitationId}`);
};

export const refuseInvitation = (senderId: number, receiverId: number) => {
    return axios.patch(`${API_URL}/user/refuseInvitation/${senderId}/${receiverId}`)
}

export const getUsersForSearchModal = (userId: number) => {
    return axios.get(`${API_URL}/user/seeOtherUsers/${userId}`)
}

export const getAnImage = (imageId: number) => {
    return axios.get(`${API_URL}/user/getAnImage/${imageId}`)
}