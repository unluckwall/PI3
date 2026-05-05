const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// =========================
// CLIMA
// =========================
app.get('/api/clima', async (req, res) => {

    try {

        const cidade = req.query.cidade;

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${process.env.API_KEY}&units=metric&lang=pt_br`
        );

        const data = await response.json();

        res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            erro: 'Erro ao buscar clima'
        });
    }
});

// =========================
// PRECIPITAÇÃO
// =========================
app.get('/api/precipitacao', async (req, res) => {

    try {

        const { lat, lon } = req.query;

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.API_KEY}`
        );

        const data = await response.json();

        const chuva =
            data.current?.rain?.["1h"] || 0;

        res.json({ chuva });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            erro: 'Erro ao buscar precipitação'
        });
    }
});

// =========================
// TESTE API
// =========================
app.get('/api', (req, res) => {

    res.json({
        status: 'API funcionando 🚀'
    });
});

// =========================
// SERVIDOR
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Servidor rodando na porta ${PORT}`);
});