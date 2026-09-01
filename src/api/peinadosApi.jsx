import axios from "axios";

export const peinadosApi = axios.create({
  baseURL: "http://217.216.95.62:9018",
  headers: {
    "Content-Type": "application/json",
    // "Content-Type": "application/json",
    Accept: "*",
    Authorization: localStorage.getItem("tokenPeinados") ? "Bearer " + localStorage.getItem("tokenPeinados") : "NADA",
  },
});
