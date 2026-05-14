import { faker } from "@faker-js/faker";
import { getRandomItem } from "./utils.js";
import { Group } from "../src/models/group.model.js";
import { GroupMembership } from "../src/models/groupMembership.model.js";


const generateGroupMemberShip = async (users, groupId, count = 10) => {
    const groupMemberShips = [];
    let i = 1;

    do {
        console.log("loop of: ", count)
        const user = getRandomItem(users);

        if (groupMemberShips.some(member => member.userId.toString() === user._id.toString())) {
            i--;
            console.log("continued: ", groupMemberShips.some(member => member.userId.toString() === user._id.toString()))
            continue;
        }
        groupMemberShips.push({
            groupId: groupId,
            userId: user._id,
            isAdmin: i === 1 ? true : false,
        });
        i++;
    } while (i <= count);

    const groupMemberShip = await GroupMembership.create(groupMemberShips);

    return groupMemberShip;
}


const generateGroups = async (users, count = 10) => {
    const groups = [];

    for (let i = 0; i < count; i++) {
        groups.push({
            name: faker.lorem.words(2),
            description: faker.lorem.sentence(),
        });
    }

    return await Group.create(groups);
}

export {
    generateGroups,
    generateGroupMemberShip,
}