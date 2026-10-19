import { useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";
import { format } from "date-fns-tz";

export const useCumpleañosProximos = () => {
  const [dataCumpleañosProximos, setDataCumpleañosProximos] = useState([]);
  const [loadingCumpleaños, setLoadingCumpleaños] = useState(false);

  const fetchCumpleañosProximos = async () => {
    setLoadingCumpleaños(true);
    try {
      const response = await peinadosApi.get(`/clientes?id=0`);
      setDataCumpleañosProximos(response.data);
      return response;
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCumpleaños(false);
    }
  };

  return { dataCumpleañosProximos, loadingCumpleaños, fetchCumpleañosProximos };
};
