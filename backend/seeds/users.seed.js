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
        username: "urvitgehlot",
        displayName: "Urvit Gehlot",
        email: "urvitgehlotug@gmail.com",
        password: "Urvit@gehlot123",
        avatarUrl: "https://images.unsplash.com/photo-1654110455429-cf322b40a906"
    })

    return await User.create(users);
}


export { generateUsers };