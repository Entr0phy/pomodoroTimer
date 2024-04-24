import { Router } from 'express'
import configurations from '../controller/configurations'

const router = Router();

router.patch('/updateConfigurations', async (req, res) => {
    try {
        const result = await configurations.updateConfiguration(req.body);

        res.status(201).json(result);
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

export default router