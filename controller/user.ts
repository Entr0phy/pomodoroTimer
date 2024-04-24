import db from '../db'
import { createUserParams, User } from '../types/userTypes'

const createUser = async ({ name, email }: createUserParams): Promise<User> => {
    const createUserQuery = `
        INSERT INTO 
            users (name, email)
        VALUES
            ($1, $2)
        RETURNING *
    `

    const createUserConfigurationQuery = `
        INSERT INTO 
            configurations (user_id)
        VALUES
            ($1)
        RETURNING *
    `

    await db.query('BEGIN');

    try {

        //Insert new user into the user table
        const userResult = await db.query(createUserQuery, [name, email])
        const userValue = userResult.rows[0]
        const userId = userResult.rows[0].id

        //Insert a new record into the user configuration table
        await db.query(createUserConfigurationQuery, [userId])

        //Commit the transaction
        await db.query('COMMIT')
        console.log('User created successfully')
        return userValue
    } catch (e) {
        await db.query('ROLLBACK')
        console.log(' Failed to create a user:', e);
        throw e;
    }

}

const updateUser = async ({ id, name, email }: User): Promise<User> => {
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

const deleteUser = async (id: Number): Promise<User> => {
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

const findUserById = async (id: Number): Promise<User> => {
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