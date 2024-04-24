import express from 'express';
const app = express();

import user from './routes/user'
import configuration from './routes/configurations'
import session from './routes/session'
app.use(express.json());

app.use('/user',user)
app.use('/configuration',configuration)
app.use('/session',session)

app.get('/', (req, res) => {
  res.send('hello from express server');
});

export default app;