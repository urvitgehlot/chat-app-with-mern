import { faker } from '@faker-js/faker';
import { User } from '../src/models/user.model.js';

const generateUsers = async (count = 10) => {
    const users = [];

    for (let i = 1; i <= count; i++) {
        users.push({
            username: faker.internet.username(),
            displayName: faker.internet.displayName(),
            email: faker.internet.email(),
            password: "Dummy@pass123",
            avatarUrl: faker.image.url(),
        })
    }

    users.push({
        username: "test1",
        displayName: "Test User 1",
        email: "test1@gmail.com",
        password: "usertest",
        avatarUrl: faker.image.avatar()
    })

    users.push({
        username: "test2",
        displayName: "Test User 2",
        email: "test2@gmail.com",
        password: "usertest",
        avatarUrl: faker.image.avatar()
    })

    return await User.create(users);
}


export { generateUsers };