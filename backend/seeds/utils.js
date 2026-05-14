const getRandomItem = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
};

const getTwoRandomUsers = (users) => {
    let user1 = getRandomItem(users);
    let user2;

    do {
        user2 = getRandomItem(users);
    } while (user1._id.toString() === user2._id.toString());

    return [user1, user2];
};

export { getRandomItem, getTwoRandomUsers };