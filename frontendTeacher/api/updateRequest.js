import { instance } from './api'

export const updateUserInfo = async (newUserData ) => {
    if (!newUserData?.id) {
        throw new Error("User ID is required to update user info");
    }
    
    try{
        const uri = "/users/" + newUserData.id + "/";
        const res = await instance.put(uri, newUserData);
        return res.data;
    }catch(err){
        console.error("Error updating user data: ", err);
        return null;
    }
}