const USERNAME_KEY = "username"
export const SAFE_MIRRORED_SESSION_COOKIE_NAME = "SAFE_MIRRORED_SESSION_COOKIE"

const saveUserName = (username: string) => {
    localStorage.setItem(USERNAME_KEY, username);
}

const getUserName = () => {
    return localStorage.getItem(USERNAME_KEY);
}

const isUserLoggedIn = () => {
    return isSafeMirroredSessionCookie()
}

const isSafeMirroredSessionCookie = () => {
    // the real session cookie is protected by accessing it from javascript
    // that's why for authentication mirrored session cookie is used
    return document.cookie.includes(SAFE_MIRRORED_SESSION_COOKIE_NAME)
}

const UserStorage = {
    saveUserName,
    getUserName,
    isUserLoggedIn
};

export default UserStorage;