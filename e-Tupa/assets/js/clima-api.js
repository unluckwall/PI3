document.addEventListener('DOMContentLoaded', function () {

    // =========================
    // CONFIGURAÇÕES
    // =========================
    const CONFIG = {
        cidades: {
            Sensores1: { lat: -22.4428, lon: -46.7993 },
            Sensores2: { lat: -22.4472, lon: -46.7945 },
            Sensores3: { lat: -22.4512, lon: -46.7942 },
        },

        apiBaseUrl:
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
                ? 'http://localhost:3000/api'
                : '/api'
    };

    // =========================
    // ELEMENTOS DOM
    // =========================
    const elementos = {
        chuva: document.getElementById('nivelChuva'),
        agua: document.getElementById('nivelAgua'),
        umidade: document.getElementById('nivelUmidade'),
        risco: document.getElementById('riscoEnchente'),
        status: document.getElementById('status-clima'),
        select: document.getElementById('localSelect')
    };

    // =========================
    // DADOS DOS SENSORES
    // =========================
    let sensorData = {
        nivelAgua: null,
    };


    // =========================
    // GRAFICO DE NÍVEL DA ÁGUA
    // =========================
    let aguaChart = null;  // só um gráfico global
    let aguaData = [];     // histórico

    function atualizarGraficoAgua(nivelAgua) {
        aguaData.push(nivelAgua);

        if (aguaData.length > 5) aguaData.shift(); 

        const ctx = document.getElementById('nivelAguaChart').getContext('2d');

        if (!aguaChart) {
            aguaChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: aguaData.map((_, i) => `T-${aguaData.length - i}`),
                    datasets: [{
                        label: 'Nível ate a margem (m)',
                        data: aguaData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: false,
                    scales: {
                        y: { beginAtZero: true, max: 15}
                    }
                }
            });
        } else {
            aguaChart.data.labels = aguaData.map((_, i) => `T-${aguaData.length - i}`);
            aguaChart.data.datasets[0].data = aguaData;
            aguaChart.update();
        }
    }

    // =========================
    // SIMULAÇÕES
    // =========================
    function simularChuva() {
        return parseFloat((Math.random() * 30).toFixed(1));
    }

    function simularNivelAgua(chuva) {
        if (chuva === null) return Math.floor(Math.random(10) * 0.4);

        return Math.floor((chuva * 5) + (Math.random() * 30));
    }

    // =========================
    // CÁLCULO DE RISCO
    // =========================
    function calcularRisco(chuva, nivelAgua) {

        const riscoScore = (chuva * 0.4) + (nivelAgua * 0.6);

        if (riscoScore > 100) return "Margem Comprometida";
        if (riscoScore > 70) return "Próximo da Margem";
        if (riscoScore > 40) return "Nível Elevado";

        return "Estável";
    }

    // =========================
    // BUSCAR PRECIPITAÇÃO NO BACKEND
    // =========================
    async function obterPrecipitacao(lat, lon) {

        try {

            const response = await fetch(
                `${CONFIG.apiBaseUrl}/precipitacao?lat=${lat}&lon=${lon}`
            );

            if (!response.ok) {
                throw new Error("Erro ao buscar precipitação");
            }

            const data = await response.json();

            return data.chuva;

        } catch (err) {

            console.error("Erro precipitação backend:", err);

            return null;
        }
    }

    // =========================
    // MAPA
    // =========================
    let mapa;

    function carregarMapa(lat, lon) {

        if (!mapa) {

            mapa = L.map('forecastMap').setView([lat, lon], 15);

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution: "© OpenStreetMap"
                }
            ).addTo(mapa);

        } else {

            mapa.setView([lat, lon], 15);
        }
        adicionarMarkers(CONFIG.cidades);


    }

    // =========================
    // MARKERS DO MAPA
    // =========================
    let markers = [];

    function adicionarMarkers(regioes) {
        // remove markers antigos
        markers.forEach(m => mapa.removeLayer(m));
        markers = [];

        Object.keys(regioes).forEach(nome => {
            const { lat, lon } = regioes[nome];

            const marker = L.marker([lat, lon]).addTo(mapa)
                .bindPopup(nome); // popup mostrando o nome da região

            markers.push(marker);
        });
    }

    // =========================
    // ATUALIZAR INTERFACE
    // =========================
    function atualizarInterface(dados) {

        elementos.chuva.textContent =
            dados.chuva !== null
                ? `${dados.chuva} mm`
                : '--';

        elementos.agua.textContent =
            `${dados.nivelAgua} m`;

        elementos.umidade.textContent =
            dados.umidade !== null
                ? `${dados.umidade}%`
                : '--';

        elementos.risco.textContent =
            dados.risco;

        elementos.status.textContent =
            `Local: ${dados.local} | Temp: ${dados.temperatura ?? '--'}°C | Vento: ${dados.vento ?? '--'} km/h`;

        atualizarGraficoAgua(dados.nivelAgua);
    }

    // =========================
    // ERRO NA INTERFACE
    // =========================
    function mostrarErro() {

        elementos.status.textContent =
            'Erro ao obter dados climáticos.';

        elementos.chuva.textContent = '--';
        elementos.agua.textContent = '--';
        elementos.umidade.textContent = '--';
        elementos.risco.textContent = '--';
    }

    // =========================
    // BUSCAR CLIMA
    // =========================
    async function fetchClima(local, coords = null) {

        const locationCoords =
            coords ||
            CONFIG.cidades[local] ||
            CONFIG.cidades['Regiao1'];

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${locationCoords.lat}&longitude=${locationCoords.lon}&current_weather=true&hourly=precipitation,relative_humidity_2m`;

        try {

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Erro ao obter Open-Meteo");
            }

            const data = await response.json();

            const weather = data.current_weather || {};

            const nowHour = new Date().getHours();

            let chuva;

            if (local === "Simulado") {

                chuva = simularChuva();

            } else {

                chuva =
                    await obterPrecipitacao(
                        locationCoords.lat,
                        locationCoords.lon
                    );

                if (chuva === null) {
                    chuva =
                        data.hourly?.precipitation?.[nowHour] ?? null;
                }
            }

            const umidade =
                data.hourly?.relative_humidity_2m?.[nowHour] ?? null;

            
            sensorData.chuva = chuva;

            sensorData.nivelAgua =
                simularNivelAgua(chuva);

            const risco =
                calcularRisco(
                    chuva ?? 0,
                    sensorData.nivelAgua
                );

            atualizarInterface({
                local,
                chuva,
                nivelAgua: sensorData.nivelAgua,
                umidade,
                risco,
                temperatura: weather.temperature,
                vento: weather.windspeed
            });

        } catch (e) {

            console.error(e);

            mostrarErro();
        }

        carregarMapa(
            locationCoords.lat,
            locationCoords.lon
        );
    }

   

    // =========================
    // EVENTOS
    // =========================
    elementos.select.addEventListener('change', function () {

        fetchClima(this.value);
    });

    
    // =========================
    // INICIALIZAÇÃO
    // =========================
    fetchClima(elementos.select.value);

});