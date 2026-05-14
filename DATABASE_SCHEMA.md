# Database Schema Reference — MERN Chat App

> **Stack:** MongoDB + Mongoose (Node.js/Express backend)
> **Database:** MongoDB (NoSQL, document-based)
> **Total Collections:** 8

---

## 1. User

**Collection name:** `users`
**Model name:** `User`

| Field          | Type     | Required | Unique | Default | Notes                                      |
|----------------|----------|----------|--------|---------|--------------------------------------------|
| `_id`          | ObjectId | auto     | yes    | auto    | MongoDB default primary key                |
| `username`     | String   | yes      | yes    |         |                                            |
| `email`        | String   | yes      | yes    |         |                                            |
| `password`     | String   | yes      | no     |         | Hashed with bcrypt (10 salt rounds) on save |
| `displayName`  | String   | yes      | no     |         |                                            |
| `avatarUrl`    | String   | no       | no     |         |                                            |
| `aboutMe`      | String   | no       | no     |         |                                            |
| `lastActiveAt` | Date     | no       | no     |         |                                            |
| `refreshToken` | String   | no       | no     |         | JWT refresh token stored server-side       |
| `createdAt`    | Date     | auto     | no     | auto    | Mongoose timestamps                       |
| `updatedAt`    | Date     | auto     | no     | auto    | Mongoose timestamps                       |

**Instance Methods:**
- `isPasswordCorrect(password)` → compares plain text password with hashed password using bcrypt
- `generateAccessToken()` → returns a JWT signed with `ACCESS_TOKEN_SECRET`, payload: `{ _id, username, email }`, expires per `ACCESS_TOKEN_EXPIRY`
- `generateRefreshToken()` → returns a JWT signed with `REFRESH_TOKEN_SECRET`, payload: `{ _id }`, expires per `REFRESH_TOKEN_EXPIRY`

**Hooks:**
- `pre("save")` → hashes `password` field with bcrypt if modified

---

## 2. DirectChat

**Collection name:** `directchats`
**Model name:** `DirectChat`

| Field           | Type         | Required | Default | Notes                              |
|-----------------|--------------|----------|---------|------------------------------------|
| `_id`           | ObjectId     | auto     | auto    | MongoDB default primary key        |
| `participants`  | [ObjectId]   | no       |         | Array of refs → `User`. Typically 2 users for a 1-on-1 chat |
| `chatCreatedBy` | ObjectId     | yes      |         | Ref → `User`. The user who initiated the chat |
| `createdAt`     | Date         | auto     | auto    | Mongoose timestamps                |
| `updatedAt`     | Date         | auto     | auto    | Mongoose timestamps                |

**Relationships:** Each participant ObjectId references the `User` collection.

**Indexes:**
- `{ participants: 1 }` — efficient lookup of chats by participant

---

## 3. Group

**Collection name:** `groups`
**Model name:** `Group`

| Field         | Type     | Required | Default | Notes                       |
|---------------|----------|----------|---------|-----------------------------|
| `_id`         | ObjectId | auto     | auto    | MongoDB default primary key |
| `name`        | String   | yes      |         | Group display name          |
| `description` | String   | no       |         |                             |
| `createdAt`   | Date     | auto     | auto    | Mongoose timestamps         |
| `updatedAt`   | Date     | auto     | auto    | Mongoose timestamps         |

---

## 4. GroupMembership

**Collection name:** `groupmemberships`
**Model name:** `GroupMembership`

| Field      | Type     | Required | Default    | Notes                            |
|------------|----------|----------|------------|----------------------------------|
| `_id`      | ObjectId | auto     | auto       | MongoDB default primary key      |
| `isAdmin`  | Boolean  | no       | `false`    | Whether the member is a group admin |
| `groupId`  | ObjectId | yes      |            | Ref → `Group`                    |
| `userId`   | ObjectId | yes      |            | Ref → `User`                     |
| `joinedAt` | Date     | no       | `Date.now` |                                  |
| `createdAt`| Date     | auto     | auto       | Mongoose timestamps              |
| `updatedAt`| Date     | auto     | auto       | Mongoose timestamps              |

**Relationships:** Junction/pivot table linking `User` ↔ `Group` (many-to-many).

**Indexes:**
- `{ groupId: 1, userId: 1 }` — unique compound index, prevents duplicate memberships
- `{ userId: 1 }` — find all groups for a user

---

## 5. Message

**Collection name:** `messages`
**Model name:** `Message`

| Field              | Type     | Required | Default    | Enum                  | Notes                                       |
|--------------------|----------|----------|------------|-----------------------|---------------------------------------------|
| `_id`              | ObjectId | auto     | auto       |                       | MongoDB default primary key                 |
| `groupId`          | ObjectId | no       |            |                       | Ref → `Group`. Set when `chatType = "group"` |
| `replyToMessageId` | ObjectId | no       |            |                       | Ref → `Message` (self-ref for threaded replies) |
| `directChat`       | ObjectId | no       |            |                       | Ref → `DirectChat`. Set when `chatType = "direct"` |
| `chatType`         | String   | yes      |            | `"direct"`, `"group"` | Discriminator for which chat context applies |
| `content`          | String   | yes      |            |                       | Text body of the message                    |
| `senderId`         | ObjectId | yes      |            |                       | Ref → `User`                                |
| `sentAt`           | Date     | no       | `Date.now` |                       |                                             |
| `createdAt`        | Date     | auto     | auto       |                       | Mongoose timestamps                         |
| `updatedAt`        | Date     | auto     | auto       |                       | Mongoose timestamps                         |

**Hooks:**
- `pre("save")` → Clears `groupId` when `chatType = "direct"`, clears `directChat` when `chatType = "group"`. Ensures only the relevant chat reference is stored.

**Indexes:**
- `{ directChat: 1, sentAt: 1 }` — fetch direct chat messages sorted by time
- `{ groupId: 1, sentAt: 1 }` — fetch group messages sorted by time
- `{ senderId: 1 }` — find all messages by a user

---

## 6. Attachment

**Collection name:** `attachments`
**Model name:** `Attachment`

| Field       | Type     | Required | Default | Enum                               | Notes                       |
|-------------|----------|----------|---------|------------------------------------|-----------------------------|
| `_id`       | ObjectId | auto     | auto    |                                    | MongoDB default primary key |
| `publicId`  | String   | yes      |         |                                    | Cloud storage ID (e.g. Cloudinary) |
| `fileUrl`   | String   | yes      |         |                                    | URL to access the file      |
| `fileType`  | String   | yes      |         | `"image"`, `"video"`, `"document"` |                             |
| `fileSize`  | Number   | yes      |         |                                    | Size in bytes               |
| `messageId` | ObjectId | yes      |         |                                    | Ref → `Message`             |
| `createdAt` | Date     | auto     | auto    |                                    | Mongoose timestamps         |
| `updatedAt` | Date     | auto     | auto    |                                    | Mongoose timestamps         |

---

## 7. MessageReaction

**Collection name:** `messagereactions`
**Model name:** `MessageReaction`

| Field       | Type     | Required | Default | Notes                       |
|-------------|----------|----------|---------|-----------------------------|
| `_id`       | ObjectId | auto     | auto    | MongoDB default primary key |
| `messageId` | ObjectId | yes      |         | Ref → `Message`             |
| `userId`    | ObjectId | yes      |         | Ref → `User`                |
| `reaction`  | String   | yes      |         | Emoji or reaction identifier |
| `createdAt` | Date     | auto     | auto    | Mongoose timestamps         |
| `updatedAt` | Date     | auto     | auto    | Mongoose timestamps         |

**Indexes:**
- `{ messageId: 1, userId: 1 }` — unique compound index, one reaction per user per message

---

## 8. ReadReceipt

**Collection name:** `readreceipts`
**Model name:** `ReadReceipt`

| Field       | Type     | Required | Default | Notes                                   |
|-------------|----------|----------|---------|-----------------------------------------|
| `_id`       | ObjectId | auto     | auto    | MongoDB default primary key             |
| `messageId` | ObjectId | yes      |         | Ref → `Message`                         |
| `userId`    | ObjectId | yes      |         | Ref → `User`. The user who read the msg |
| `createdAt` | Date     | auto     | auto    | Mongoose timestamps (acts as "readAt")  |
| `updatedAt` | Date     | auto     | auto    | Mongoose timestamps                     |

**Indexes:**
- `{ messageId: 1, userId: 1 }` — unique compound index, prevents duplicate read receipts

---

## Entity Relationship Diagram

```
User ──┬──< DirectChat.participants[]     (many-to-many via array)
       ├──< DirectChat.chatCreatedBy      (one-to-many)
       ├──< GroupMembership.userId ───> Group.groupId   (many-to-many via junction)
       ├──< Message.senderId              (one-to-many)
       ├──< MessageReaction.userId        (one-to-many)
       └──< ReadReceipt.userId            (one-to-many)

Message ──┬──> DirectChat (when chatType = "direct")
          ├──> Group      (when chatType = "group")
          ├──> Message    (self-ref via replyToMessageId)
          ├──< Attachment.messageId        (one-to-many)
          ├──< MessageReaction.messageId   (one-to-many)
          └──< ReadReceipt.messageId       (one-to-many)
```

---

## Auth Flow Summary

- Passwords are hashed with **bcrypt** (10 rounds) before saving.
- **Access tokens** (JWT) contain `{ _id, username, email }` and are short-lived.
- **Refresh tokens** (JWT) contain `{ _id }`, are longer-lived, and stored in the `User.refreshToken` field.
- Tokens are delivered via **HTTP-only cookies**.