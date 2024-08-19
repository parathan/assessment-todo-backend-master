export default (db) => {
    const { TODO_COLLECTION } = process.env;
    const collection = db.collection(TODO_COLLECTION);

    async function insertOne(todo) {
        return await collection.insertOne(todo);
    }

    async function findAllByUserID(userID) {
        return await collection.find({
            userID
        }).toArray();
    }

    async function updateOneByIDandUserID(todoID, userID, todo) {

        const filter = {
            todoID: todoID,
            userID: userID
        }

        const updateDoc = {
            $set: todo
        }

        return await collection.updateOne(filter, updateDoc);
    }

    return {
        insertOne,
        findAllByUserID,
        updateOneByIDandUserID
    };
};