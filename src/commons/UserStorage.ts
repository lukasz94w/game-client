const USERNAME_KEY = "username"

const saveUserName = (username: string) => {
    localStorage.setItem(USERNAME_KEY, username);
}

const getUserName = () => {
    return localStorage.getItem(USERNAME_KEY);
}

const UserStorage = {
    saveUserName,
    getUserName
};

export default UserStorage;