const { initializeApp } = require("firebase/app");
const { getDatabase, ref, onValue } = require("firebase/database");

const firebaseConfig = {
  databaseURL: "https://pi-3-bbf59-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function iniciarMonitoramento() {
  const sensorRef = ref(db, "dispositivos/sensor1");

  onValue(sensorRef, (snapshot) => {
    const dados = snapshot.val();

    if (!dados) {
      console.log("Sensor não encontrado");
      return;
    }

    const ativo = dados.ativo;
    const nivel = dados.nivel;
    const ultimoUpdate = dados.ultimo_update;

    console.log("Dados:", dados);

    if (ativo) {
      console.log(" SENSOR ATIVO");
      console.log(" Nível da água:", nivel);

      if (nivel >= 80) {
        console.log(" RISCO DE ENCHENTE");
      }
    } else {
      console.log(" Sensor inativo");
    }

    console.log("Última atualização:", ultimoUpdate);
    console.log("----------------------");
  });
}

module.exports = iniciarMonitoramento;