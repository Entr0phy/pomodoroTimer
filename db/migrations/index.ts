import db from '..'
import createTables from './createTable'

const runDBMigrations = async (): Promise<void> => {
    console.log('BEGIN DB MIGRATIONS')

    const client = await db.connect();

    try {
        await client.query('BEGIN')

        await client.query(createTables)

        await client.query('COMMIT')

        console.log('END DB MIGRATION')
    } catch (e: unknown) {
        await client.query('ROLLBACK')

        console.log('DB MIGRATION FAILED')

        throw e
    }
    finally {
        client.release();
    }
}

export default runDBMigrations