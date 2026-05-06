import axios from "axios";

export const peinadosApi = axios.create({
  baseURL: "/peinadosapi",
  headers: {
    "Content-Type": "text/plain; charset=UTF-8; application/json",
    // "Content-Type": "application/json",
    Accept: "*",
    Authorization: localStorage.getItem("tokenPeinados") ? "Bearer " + localStorage.getItem("tokenPeinados") : "NADA",
  },
});
