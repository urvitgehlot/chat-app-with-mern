import { faker } from '@faker-js/faker';
import { User } from '../src/models/user.model.js';

const generateUsers = async (count = 10) => {
    const users = [];

    for (let i = 1; i <= count; i++) {
        users.push({
            username: faker.internet.username(),
            displayName: faker.internet.displayName(),
            email: faker.internet.email(),
            password: process.env.USER_PASS,
            avatarUrl: faker.image.url(),
        })
    }

    users.push({
        username: "test1",
        displayName: "Test User 1",
        email: process.env.USER1_EMAIL,
        password: process.env.USER1_PASS,
        avatarUrl: faker.image.avatar()
    })

    users.push({
        username: "test2",
        displayName: "Test User 2",
        email: process.env.USER2_EMAIL,
        password: process.env.USER2_PASS,
        avatarUrl: faker.image.avatar()
    })

    return await User.create(users);
}


export { generateUsers };