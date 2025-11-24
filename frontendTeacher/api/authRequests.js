import { apiClient } from './api'

export const getLoggedUserInfo = async () => {
    try{
        const res = await apiClient.get("/account/profile/");
        return res.data;
    }catch(err){
        console.error("Error fetching logged user data: ", err);
        return null;
    }
}

export const changePassword = async (oldPassword, newPassword) => {
    try{
        const res = await apiClient.put("/change-password/", {
            old_password: oldPassword,
            new_password: newPassword
        });
        return res.data;
    }catch(err){
        console.error("Error changing password: ", err);
        return null;
    }
}
