document.addEventListener('DOMContentLoaded', function() {
    const cityCoords = {
        'Tupã': { lat: -21.9347, lon: -50.5136 },
        'Marília': { lat: -22.2171, lon: -49.9501 },
        'Bauru': { lat: -22.3146, lon: -49.0581 },
        'Ourinhos': { lat: -22.9797, lon: -49.8696 },
        'Aracruz': { lat: -17.4153, lon: -41.2153 }
    };

    async function fetchClima(local, coords = null) {
        const locationCoords = coords || cityCoords[local] || cityCoords['Tupã'];
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${locationCoords.lat}&longitude=${locationCoords.lon}&current_weather=true&hourly=precipitation,relative_humidity_2m`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            const weather = data.current_weather;
            // Precipitation and humidity from hourly (current hour)
            const now = new Date();
            const hourIndex = now.getHours();
            const chuva = data.hourly && data.hourly.precipitation ? data.hourly.precipitation[hourIndex] + ' mm' : '--';
            const umidade = data.hourly && data.hourly.relative_humidity_2m ? data.hourly.relative_humidity_2m[hourIndex] + '%' : '--';
            // Simulate risk based on precipitation
            let risco = 'Baixo';
            if (data.hourly && data.hourly.precipitation && data.hourly.precipitation[hourIndex] > 20) risco = 'Crítico';
            else if (data.hourly && data.hourly.precipitation && data.hourly.precipitation[hourIndex] > 10) risco = 'Alto';
            else if (data.hourly && data.hourly.precipitation && data.hourly.precipitation[hourIndex] > 2) risco = 'Moderado';

            document.getElementById('nivelChuva').textContent = chuva;
            document.getElementById('nivelAgua').textContent = '--'; // Not available in Open-Meteo
            document.getElementById('nivelUmidade').textContent = umidade;
            document.getElementById('riscoEnchente').textContent = risco;
            document.getElementById('status-clima').textContent = `Local: ${local} | Tempo: ${weather.temperature}°C, Vento: ${weather.windspeed} km/h`;
        } catch (e) {
            document.getElementById('status-clima').textContent = 'Erro ao obter dados climáticos.';
            document.getElementById('nivelChuva').textContent = '--';
            document.getElementById('nivelAgua').textContent = '--';
            document.getElementById('nivelUmidade').textContent = '--';
            document.getElementById('riscoEnchente').textContent = '--';
        }
    }

    const select = document.getElementById('localSelect');
    select.addEventListener('change', function() {
        fetchClima(this.value);
    });
    fetchClima(select.value);

    // Function to get user's location and update the dropdown
    function useMyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                // Reverse geocoding to get location name
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                if (data && data.address) {
                    const locationName = data.address.city || data.address.town || data.address.village || "Localização Desconhecida";

                    // Add location to dropdown and select it
                    const locationSelect = document.getElementById("localSelect");
                    const newOption = document.createElement("option");
                    newOption.value = locationName;
                    newOption.textContent = locationName;
                    locationSelect.appendChild(newOption);
                    locationSelect.value = locationName;

                    // Trigger climate data fetch for the new location
                    fetchClima(locationName, { lat: latitude, lon: longitude });
                } else {
                    alert("Não foi possível determinar sua localização.");
                }
            }, () => {
                alert("Não foi possível acessar sua localização. Verifique as permissões do navegador.");
            });
        } else {
            alert("Geolocalização não é suportada pelo seu navegador.");
        }
    }

    // Add event listener to the button
    document.getElementById("useMyLocation").addEventListener("click", useMyLocation);
});
