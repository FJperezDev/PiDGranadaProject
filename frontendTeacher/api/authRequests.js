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
