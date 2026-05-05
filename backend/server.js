const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// rota teste
app.get('/api', (req, res) => {
  res.send('API rodando 🚀');
});

// rota para sensor
app.post('/api/sensor', (req, res) => {
  const dados = req.body;

  console.log('Dados recebidos:', dados);

  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});