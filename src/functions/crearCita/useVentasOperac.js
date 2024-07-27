import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";

export const usePrepagos = () => {
  const [dataPrepagos, setDataPrepagos] = useState([]);

  const fetchPrepagos = async () => {
    try {
      const response = await peinadosApi.get("/sp_catPrepagosSel?idPrepago=0");
      setDataPrepagos(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchPrepagos();
  }, []);

  return { dataPrepagos, fetchPrepagos };
};
