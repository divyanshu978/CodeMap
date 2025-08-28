// sample-project/app.js
import { v4 as uuidv4 } from 'uuid';

export class User {
    id;
    name;

    constructor(name) {
        this.id = uuidv4();
        this.name = name;
    }

    greet() {
        return `Hello, ${this.name}`;
    }
}

export function createUser(name) {
    const newUser = new User(name);
    return newUser;
}

const user = createUser("Adish");
