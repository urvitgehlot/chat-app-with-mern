import Dexie from "dexie";

const db = new Dexie("ChatAppDB");

// Schema mirrors backend MongoDB models
// Only indexed fields are listed — Dexie stores all fields, these are just for querying
db.version(1).stores({
});

export default db;
