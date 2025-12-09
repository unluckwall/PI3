document.addEventListener('DOMContentLoaded', function () {


    const apiKeyOW = "74e091b4ba4211306e7fdd29fbfccd05";
    const cityCoords = {
        'Região 1': { lat: -22.4233, lon: -46.8267 },
        'Região 2': { lat: -22.4409, lon: -46.8185 },
        'Região 3': { lat: -22.4294, lon: --46.8222 },
    };


    // Simulação de chuva
    function simularChuva() {
        return parseFloat((Math.random() * 30).toFixed(1));
    }

    // Simulação do nível da água
    function simularNivelAgua(chuva) {
        if (chuva === null) return Math.floor(Math.random() * 40);
        return Math.floor((chuva * 5) + (Math.random() * 30));
    }

    // Cálculo do risco
    function calcularRisco(chuva, nivelAgua) {
        if (chuva > 20 || nivelAgua > 150) return "Crítico";
        if (chuva > 10 || nivelAgua > 100) return "Alto";
        if (chuva > 2 || nivelAgua > 50) return "Moderado";
        return "Baixo";
    }

    async function obterPrecipitacaoOpenWeather(lat, lon) {
        const url = `https://api.openweathermap.org/data//onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKeyOW}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao obter OpenWeather");

            const data = await response.json();
            return data.current.rain ? data.current.rain["1h"] : 0;

        } catch (err) {
            console.error("Erro precipitação OpenWeather:", err);
            return null;
        }
    }

    let mapa;

    function carregarMapa(lat, lon) {
        if (!mapa) {
            mapa = L.map('forecastMap').setView([lat, lon], 6);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap"
            }).addTo(mapa);

        } else {
            mapa.setView([lat, lon], 6);
        }

        mapa.radarLayer = L.tileLayer(
            `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKeyOW}`,
            { opacity: 0.6 }
        ).addTo(mapa);
    }



    // Busca clima completo
    async function fetchClima(local, coords = null) {
        const locationCoords = coords || cityCoords[local] || cityCoords['Tupã'];

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${locationCoords.lat}&longitude=${locationCoords.lon}&current_weather=true&hourly=precipitation,relative_humidity_2m`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao obter Open-Meteo");

            const data = await response.json();
            const weather = data.current_weather || {};
            const nowHour = new Date().getHours();

            let chuva;

            if (local === "Simulado") {
                chuva = simularChuva();
            } else {
                chuva = data.hourly?.precipitation?.[nowHour] ?? null;
            }

            const umidade = data.hourly?.relative_humidity_2m?.[nowHour] ?? null;
            const nivelAgua = simularNivelAgua(chuva);
            const risco = calcularRisco(chuva ?? 0, nivelAgua);

            document.getElementById('nivelChuva').textContent =
                chuva !== null ? `${chuva} mm` : '--';
            document.getElementById('nivelAgua').textContent = `${nivelAgua} m`;
            document.getElementById('nivelUmidade').textContent =
                umidade !== null ? `${umidade}%` : '--';
            document.getElementById('riscoEnchente').textContent = risco;

            document.getElementById('status-clima').textContent =
                `Local: ${local} | Temp: ${weather.temperature ?? '--'}°C | Vento: ${weather.windspeed ?? '--'} km/h`;

        } catch (e) {
            console.error(e);

            document.getElementById('status-clima').textContent =
                'Erro ao obter dados climáticos.';
            document.getElementById('nivelChuva').textContent = '--';
            document.getElementById('nivelAgua').textContent = '--';
            document.getElementById('nivelUmidade').textContent = '--';
            document.getElementById('riscoEnchente').textContent = '--';
        }

        carregarMapa(locationCoords.lat, locationCoords.lon);
    }

    // Dropdown de seleção de localização
    const select = document.getElementById('localSelect');
    select.addEventListener('change', function () {
        fetchClima(this.value);
    });

    // Carrega clima inicial
    fetchClima(select.value);

    //  Localização real do usuário
    function useMyLocation() {
        if (!navigator.geolocation) {
            alert("Seu navegador não suporta geolocalização.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );

                const data = await response.json();
                const locationName =
                    data.address?.city ||
                    data.address?.town ||
                    data.address?.village ||
                    "Localização";

                if (![...select.options].some(opt => opt.value === locationName)) {
                    const newOption = document.createElement("option");
                    newOption.value = locationName;
                    newOption.textContent = locationName;
                    select.appendChild(newOption);
                }

                select.value = locationName;
                fetchClima(locationName, { lat: latitude, lon: longitude });

            } catch (e) {
                console.error(e);
                alert("Erro ao obter localização!");
            }

        }, () => {
            alert("Não foi possível acessar sua localização.");
        });
    }

    document.getElementById("useMyLocation")
        .addEventListener("click", useMyLocation);

});
