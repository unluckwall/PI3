const express = require('express');
const cors = require('cors');
process.env.API_KEY

const app = express();
app.use(cors());

app.get('/api/clima', async (req, res) => {
  try {
    const cidade = req.query.cidade;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${process.env.API_KEY}&units=metric&lang=pt_br`
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar clima' });
  }
});

app.get('/api/precipitacao', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.API_KEY}`
    );

    const data = await response.json();

    const chuva = data.current?.rain?.["1h"] || 0;

    res.json({ chuva });

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar precipitação' });
  }
});

app.listen(3000, () => console.log('Servidor rodando'));