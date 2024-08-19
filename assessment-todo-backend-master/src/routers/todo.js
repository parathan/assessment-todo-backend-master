import express from 'express';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { v4 as uuidv4 } from 'uuid';
import { validateTodo, validateUser } from '../schemas/validators.js';
import auth from '../middleware/auth.js';
import { verifyToken } from '../functions/cookies.js';


dayjs.extend(utc);
const router = express.Router();

export default ({todoRepository}) => {
    // Create new todo
    router.post('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            const todoID = uuidv4();
            const created = dayjs().utc().toISOString();
            const completed = false;

            let newTodo = {
                ...req.body,
                todoID,
                userID: session.userID,
                created,
                completed
            };

            if (validateTodo(newTodo)) {
                let resultTodo = await todoRepository.insertOne(newTodo);
                return res.status(201).send(resultTodo);
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Todo creation failed."});
        }
    });

    // list all todos for current user
    router.get('/', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);

            let todos = await todoRepository.findAllByUserID(session.userID);

            const validatedTodos = todos.map((todo) => {
                return {
                    ...todo,
                    name: todo.name || 'Unnamed Todo',
                    completed: todo.completed || false,
                    created: dayjs(todo.created).utc().format()
                }
            });

            todos.sort((a, b) => {
                return new Date(b.created) - new Date(a.created);
            });

            return res.status(200).send(todos);
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Failed to fetch todos."});
        }
    });

    // update todo based on given todoID
    router.put('/:todoID', auth, async (req, res) => {
        try {
            let session = verifyToken(req.cookies['todox-session']);
            const todoID = req.params.todoID;
            const userID = session.userID;
            const todo = req.body;

            if (validateTodo(todo)) {
                await todoRepository.updateOneByIDandUserID(todoID, userID, todo);
                return res.status(204).end();
            }
            console.error(validateTodo.errors);
            return res.status(400).send({error: "Invalid field used."});
        }
        catch (err) {
            console.error(err);
            return res.status(500).send({error: "Failed to update todo."});
        }
    });

    return router;
}
