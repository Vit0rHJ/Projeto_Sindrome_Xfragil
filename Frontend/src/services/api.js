import axios from "axios";

const api = axios.create({
  // isso é pra facilitar na hora de codar pq em vez de sempre ter que escrever http://localhost:3001/api/auth/login, escrevemos apenas /auth/login    baseURL: 'http://localhost:3001/api',
  baseURL: "http://localhost:3001/api",
});

api.interceptors.request.use((config) => {
  // vai servir para automatizar a busca pelos tokens do LocalStorage, com éssa parte automatizamos isso, poi vai interceptar toda requisicao antes de ser enviada e vai buscar os tokens salvos nop localstorage e vai colocar eles automaticamente no cabecalho, dai nao precisamos nos preucupra com adicionar manualmente
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
