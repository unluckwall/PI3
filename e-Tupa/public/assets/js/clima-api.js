document.addEventListener('DOMContentLoaded', function () {

    const cityCoords = {
        'Tupã': { lat: -21.9347, lon: -50.5136 },
        'Marília': { lat: -22.2171, lon: -49.9501 },
        'Bauru': { lat: -22.3146, lon: -49.0581 },
        'Ourinhos': { lat: -22.9797, lon: -49.8696 },
        'Aracruz': { lat: -17.4153, lon: -40.2735 }
    };

    function simularChuva() {
        return parseFloat((Math.random() * 30).toFixed(1));
    }

    // 🔹 Simulação temporária do nível de água
    function simularNivelAgua(chuva) {
        if (chuva === null) {
            return Math.floor(Math.random() * 40); // nível baixo
        }
        return Math.floor((chuva * 5) + (Math.random() * 30));
    }

    // 🔹 Cálculo do risco baseado em chuva + nível da água
    function calcularRisco(chuva, nivelAgua) {
        if (chuva > 20 || nivelAgua > 150) return "Crítico";
        if (chuva > 10 || nivelAgua > 100) return "Alto";
        if (chuva > 2 || nivelAgua > 50) return "Moderado";
        return "Baixo";
    }

    async function fetchClima(local, coords = null) {
        const locationCoords = coords || cityCoords[local] || cityCoords['Tupã'];


        const url = `https://api.open-meteo.com/v1/forecast?latitude=${locationCoords.lat}&longitude=${locationCoords.lon}&current_weather=true&hourly=precipitation,relative_humidity_2m`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Erro ao buscar API");

            const data = await response.json();

            const weather = data.current_weather || {};
            const nowHour = new Date().getHours();

            //const chuva = data.hourly?.precipitation?.[nowHour] ?? null;
            let chuva;

            // 🔹 Se o usuário escolheu simulação, gera chuva aleatória alta
            if (local === "Simulado") {
                chuva = simularChuva();
            } else {
                chuva = data.hourly?.precipitation?.[nowHour] ?? null;
            }
            const umidade = data.hourly?.relative_humidity_2m?.[nowHour] ?? null;

            // 🔹 Simula o nível da água
            const nivelAgua = simularNivelAgua(chuva);

            // 🔹 Calcula risco real
            const risco = calcularRisco(chuva ?? 0, nivelAgua);

            // Atualiza elementos
            document.getElementById('nivelChuva').textContent = chuva !== null ? `${chuva} mm` : '--';
            document.getElementById('nivelAgua').textContent = `${nivelAgua} m`;
            document.getElementById('nivelUmidade').textContent = umidade !== null ? `${umidade}%` : '--';
            document.getElementById('riscoEnchente').textContent = risco;
            document.getElementById('status-clima').textContent =
                `Local: ${local} | Temp: ${weather.temperature ?? '--'}°C | Vento: ${weather.windspeed ?? '--'} km/h`;

        } catch (e) {
            console.error("Erro ao obter clima:", e);

            document.getElementById('status-clima').textContent = 'Erro ao obter dados climáticos.';
            document.getElementById('nivelChuva').textContent = '--';
            document.getElementById('nivelAgua').textContent = '--';
            document.getElementById('nivelUmidade').textContent = '--';
            document.getElementById('riscoEnchente').textContent = '--';
        }
    }

    // Seleção pelo dropdown
    const select = document.getElementById('localSelect');
    select.addEventListener('change', function () {
        fetchClima(this.value);
    });

    // Carrega clima inicial
    fetchClima(select.value);

    // 📍 Função de usar localização real do usuário
    function useMyLocation() {
        if (!navigator.geolocation) {
            alert("Geolocalização não é suportada pelo seu navegador.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {

            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );

                if (!response.ok) throw new Error("Erro no reverse geocoding");

                const data = await response.json();

                const locationName =
                    data.address?.city ||
                    data.address?.town ||
                    data.address?.village ||
                    "Localização";

                const locationSelect = document.getElementById("localSelect");

                if (![...locationSelect.options].some(opt => opt.value === locationName)) {
                    const newOption = document.createElement("option");
                    newOption.value = locationName;
                    newOption.textContent = locationName;
                    locationSelect.appendChild(newOption);
                }

                locationSelect.value = locationName;

                fetchClima(locationName, { lat: latitude, lon: longitude });

            } catch (err) {
                console.error("Erro ao obter localização:", err);
                alert("Erro ao detectar sua localização.");
            }

        }, () => {
            alert("Não foi possível acessar sua localização. Verifique as permissões do navegador.");
        });
    }

    document.getElementById("useMyLocation").addEventListener("click", useMyLocation);

});
