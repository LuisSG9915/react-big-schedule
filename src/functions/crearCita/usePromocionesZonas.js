import { useEffect, useState } from "react";
import { AxiosResponse } from "axios";
import { peinadosApi } from "../../api/peinadosApi";

export const usePromocionesZonas = () => {
  const [dataPromocionesZonas, setDataPromocionesZonas] = useState([]);

  const fetchPromocionesZonas = async () => {
    try {
      const response = await peinadosApi.get(`/promocionesZonas?id=0`);
      setDataPromocionesZonas(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPromocionesZonas();
  }, []);

  return { dataPromocionesZonas, fetchPromocionesZonas };
};
