import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";
import { format } from "date-fns-tz";

export const useCumpleañosProximos = () => {
  const [dataCumpleañosProximos, setDataCumpleañosProximos] = useState([]);

  const fetchCumpleañosProximos = async () => {
    try {
      const response = await peinadosApi.get(`/clientes?id=999999`);
      setDataCumpleañosProximos(response.data);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tiempoCita == "" || !tiempoCita) return;
    fetchCumpleañosProximos();
  }, [tiempoCita]);
  return { dataCumpleañosProximos, fetchCumpleañosProximos };
};
