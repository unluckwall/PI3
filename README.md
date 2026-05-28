# PI3
# 🌧️ e-TUPÃ  
### *Environmental Guardian for Alert, Notification, Data Logging & Flood-prevention*

<p align="center">
  <img src="" width="180px">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/IoT-Project-blue">
  <img src="https://img.shields.io/badge/Platform-Raspberry%20Pi%20Pico%20W-green">
  <img src="https://img.shields.io/badge/Language-MicroPython-yellow">
  <img src="https://img.shields.io/badge/Status-In%20Development-orange">
  <img src="https://img.shields.io/badge/License-MIT-lightgrey">
</p>

---

# 📘 Descrição do Projeto

O **e-TUPÃ** é um sistema IoT para **monitoramento climático urbano**, integrando:

- Sensores físicos (chuva, umidade e pressão/nível da água)  
- Dados externos via **API de clima**  
- Esp32
- Dashboard em tempo real  

Objetivo: **Prever e alertar sobre riscos de alagamento** usando tecnologia acessível e escalável.


---

# 🎯 Visão do Produto

> Criar um sistema modular, inteligente e de baixo custo que monitora chuva em tempo real, cruza dados ambientais com serviços meteorológicos externos e emite alertas automáticos para prevenir enchentes.

---

# 🧩 Funcionalidades

- 🔵 Leitura de sensores (chuva, umidade, pressão d’águ)  
- ☁️ Consulta automática a API de clima  
- 📊 Dashboard em tempo real  
- 🌐 Atualização do estado em web/app  

---
Antes de começar, você vai precisar ter instalado em sua máquina:
* **[Git](https://git-scm.com/)** (para clonar o repositório)
* **[Node.js](https://nodejs.org/)** (recomenda-se a versão LTS)
* Um gerenciador de pacotes (como **npm** ou **yarn**)
  
# Execução
- Acessa a pasta do projeto via cmd ou powershell -> comando npm install pra instalar as dependencias do projeto que vai ta no packege.json
- Depois criar o arquivo .env dentro da pasta backend, dentro dela você escreve API_KEY:74e091b4ba4211306e7fdd29fbfccd05 , pode usar porque e a chave da api real mesmo
- Por final no terminal rode npm run dev , ai ele vai rodar o back no node(servidor), depois no index.html você roda ele com a extensão liveServer do vscode mesmo
