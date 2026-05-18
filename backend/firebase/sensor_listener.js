const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = {
  databaseURL: "https://pi-3-bbf59-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const dadosSensores = {
  sensor1: null,
  sensor2: null,
  sensor3: null
};

function monitorarSensor(sensorId) {
  const sensorRef = ref(db, `dispositivos/${sensorId}`);

  onValue(sensorRef, (snapshot) => {
    const dados = snapshot.val();
    dadosSensores[sensorId] = dados;

    if (!dados) {
      console.log(`[${sensorId.toUpperCase()}] Sensor não encontrado`);
      return;
    }
    
    const ativo = dados.ativo;
    const nivel = dados.nivel;
    const ultimoUpdate = dados.ultimo_update;

    console.log(`\n--- Dados do ${sensorId.toUpperCase()} ---`);
    console.log("Dados brutos:", dados);

    if (ativo) {
      console.log(" STATUS: ATIVO");
      console.log(" Nível da água:", nivel);

      if (nivel >= 80) {
        console.log(` ⚠️ ALERTA: RISCO DE ENCHENTE NO ${sensorId.toUpperCase()}!`);
      }
    } else {
      console.log(" STATUS: INATIVO");
    }

    console.log(" Última atualização:", ultimoUpdate);
    console.log("-------------------------------------");
  });
}


function iniciarMonitoramento() {
  const sensores = ["sensor1", "sensor2", "sensor3"];
  
  // O forEach vai rodar a função monitorarSensor para cada item da lista acima
  sensores.forEach((sensor) => {monitorarSensor(sensor);});
}

module.exports = { iniciarMonitoramento, dadosSensores };