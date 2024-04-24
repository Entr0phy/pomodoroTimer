import express from 'express';
const app = express();

import user from './routes/user'
app.use(express.json());

app.use('/user',user)

app.get('/', (req, res) => {
  res.send('hello from express server');
});

export default app;