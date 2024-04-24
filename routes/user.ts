import { Router } from 'express'
import user from '../controller/user'

const router = Router();

router.post('/createUser', async (req, res) => {
    try {
        const result = await user.createUser(req.body);

        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }

})

router.patch('/updateUser', async (req, res) => {
    try {
        const result = await user.updateUser(req.body);

        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }

})

router.delete('/deleteUser', async (req, res) => {
    try {
        const result = await user.deleteUser(req.body.id);

        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }

})

router.get('/findUserById/:id', async (req, res) => {
    try {
        const result = await user.findUserById(+req.params.id);

        res.json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }

})


export default router;