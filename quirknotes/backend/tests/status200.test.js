const { MongoClient, ObjectId } = require("mongodb");

test("1+2=3, empty array is empty", () => {
    expect(1 + 2).toBe(3);
    expect([].length).toBe(0);
});

const mongoURL = "mongodb://127.0.0.1:27017";
const dbName = "quirknotes";

let db;

const COLLECTIONS = {
    notes: "notes",
};

let client;
beforeAll(async () => {
    client = new MongoClient(mongoURL);

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        db = client.db(dbName);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
});

afterEach(async () => {
    await db.dropDatabase();
});

afterAll(async () => {
    await client.close();
});

const SERVER_URL = "http://localhost:4000";

test("/postNote - Post a note", async () => {
    const title = "NoteTitleTest";
    const content = "NoteTitleContent";

    const postNoteRes = await fetch(`${SERVER_URL}/postNote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: title,
            content: content,
        }),
    });

    const postNoteBody = await postNoteRes.json();

    expect(postNoteRes.status).toBe(200);
    expect(postNoteBody.response).toBe("Note added succesfully.");
});

test("/getAllNotes - Return list of zero notes for getAllNotes", async () => {
    const res = await fetch(`${SERVER_URL}/getAllNotes`);
    const body = await res.json()

    expect(body.response.length).toBe(0);
    expect(res.status).toBe(200);
});

test("/getAllNotes - Return list of two notes for getAllNotes", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    result = await col.insertOne({
        title: "two",
        content: "two",
        createdAt: new Date(),
    });

    const res = await fetch(`${SERVER_URL}/getAllNotes`);
    const body= await res.json()

    expect(body.response.length).toBe(2);
    expect(res.status).toBe(200);
});

test("/deleteNote - Delete a note", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    const response = await fetch(`${SERVER_URL}/deleteNote/${result.insertedId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const numNotes = await col.countDocuments({});

    expect(numNotes).toBe(0);
    expect(response.status).toBe(200);
});

test("/patchNote - Patch with content and title", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    const response = await fetch(`http://localhost:4000/patchNote/${result.insertedId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: "patch", content: "patch" })
        })

    const patch = await col.findOne({ _id: result.insertedId });

    expect(patch.title).toEqual("patch");
    expect(patch.content).toEqual("patch");
    expect(response.status).toBe(200);
});



test("/patchNote - Patch with just title", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    const response = await fetch(`http://localhost:4000/patchNote/${result.insertedId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: "patch" })
        })

    const patch = await col.findOne({ _id: result.insertedId });

    expect(patch.title).toEqual("patch");
    expect(patch.content).toEqual("one");
    expect(response.status).toBe(200);
});

test("/patchNote - Patch with just content", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    const response = await fetch(`http://localhost:4000/patchNote/${result.insertedId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ content: "patch" })
        })

    const patch = await col.findOne({ _id: result.insertedId });

    expect(patch.title).toEqual("one");
    expect(patch.content).toEqual("patch");
    expect(response.status).toBe(200);
});

test("/deleteAllNotes - Delete one note", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    const response = await fetch(`${SERVER_URL}/deleteAllNotes`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const numNotes = await col.countDocuments({});

    expect(numNotes).toBe(0);
    expect(response.status).toBe(200);
});

test("/deleteAllNotes - Delete three notes", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    result = await col.insertOne({
        title: "two",
        content: "two",
        createdAt: new Date(),
    });

    result = await col.insertOne({
        title: "three",
        content: "three",
        createdAt: new Date(),
    });

    const response = await fetch(`${SERVER_URL}/deleteAllNotes`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const numNotes = await col.countDocuments({});

    expect(numNotes).toBe(0);
    expect(response.status).toBe(200);
});

test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {
    const col = db.collection(COLLECTIONS.notes);
    let result = await col.insertOne({
        title: "one",
        content: "one",
        createdAt: new Date(),
    });

    const response = await fetch(`http://localhost:4000/updateNoteColor/${result.insertedId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ color: "#FF0000" })
        })

    const patch = await col.findOne({ _id: result.insertedId });

    expect(patch.color).toEqual("#FF0000");
    expect(response.status).toBe(200);
});
