import { Router } from 'express'
import session from '../controller/session'

const router = Router();

router.post('/createSession', async (req, res) => {
    try {
        const result = await session.createSession(req.body.userId);
        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }

})

router.patch ('/endSession', async ( req, res) => {
    try {
        const result = await session.endSession(req.body.sessionId);
        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.patch ('/pauseSession', async ( req, res) => {
    try {
        const result = await session.pauseSession(req.body.sessionId);
        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.patch ('/resumeSession', async ( req, res) => {
    try {
        const result = await session.resumeSession(req.body.sessionId);
        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

router.get ('/getSessionInfo/:sessionId', async ( req, res) => {
    try {
        const result = await session.getSessionInfo(+req.params.sessionId);
        res.status(201).json(result)
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

export default router;
