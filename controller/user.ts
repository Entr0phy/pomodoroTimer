import db from '../db'
import { createUserParams, User } from '../types/userTypes'

const createUser = async ({ name, email }: createUserParams): Promise<User> => {
    const query = `
        INSERT INTO 
            users (name, email)
        VALUES
            ($1, $2)
        RETURNING *
    `

    try {
        const result = await db.query(query, [name, email])
        console.log('User created successfully')
        return result.rows[0]
    } catch (e) {
        console.log(' Failed to create a user:', e);
        throw e;
    }

}

const updateUser = async ({ id, name, email} : User) : Promise<User> => {
    const query = `
        UPDATE 
            users 
        SET  
            name = $2,
            email = $3
        WHERE
            id = $1
        RETURNING *
    `;

    try {
        const result = await db.query(query, [id, name, email]);
        console.log(' User updated successfully')
        return result.rows[0]
    } catch (e) {
        console.log('Error updating a user:', e);
        throw e;
    }
}

const deleteUser = async (id: Number) : Promise<User> => {
    const query = `
        DELETE FROM
            users
        WHERE
            id = $1
        RETURNING *
    `;

    try {
        const result = await db.query(query, [id]);
        console.log(' User deleted successfully')
        return result.rows[0]
    } catch (e) {
        console.log('Error deleting a user', e)
        throw e;
    }
}

const findUserById = async (id: Number) : Promise <User> => {
    const query = `
        SELECT * FROM
            users
        WHERE
            id = $1
    `;

    try {
        const result = await db.query(query, [id]);
        return result.rows[0]
    }
    catch (e) {
        console.log('Error fetching user', e)
        throw e
    }
}

export default {
    createUser,
    updateUser,
    deleteUser,
    findUserById
}