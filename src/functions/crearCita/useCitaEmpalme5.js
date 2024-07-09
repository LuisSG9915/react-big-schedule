import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";
import { format } from "date-fns-tz";

export const useCitaEmpalme5 = ({ tiempoCita, fechacita, no_estilista, idCita }) => {
  const [dataCitaEmpalme5, setdataCitaEmpalme5] = useState([]);

  const fetchCitaEmpalme5 = async (tiempoCitaFetch, fechaCitaFetch, no_estilistaFetch, idCitaFetch) => {
    try {
      const response = await peinadosApi.get(
        `/sp_citaEmpalme5?tiempoCita=${tiempoCitaFetch ? tiempoCitaFetch : tiempoCita}&fechacita=${
          fechaCitaFetch ? format(fechaCitaFetch, "yyyy-MM-dd HH:mm") : format(fechacita, "yyyy-MM-dd HH:mm")
        }&no_estilista=${no_estilistaFetch ? no_estilistaFetch : no_estilista}&idCita=${idCitaFetch ? idCitaFetch : idCita}`
      );
      setdataCitaEmpalme5(response.data);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tiempoCita == "" || !tiempoCita) return;
    fetchCitaEmpalme5();
  }, [tiempoCita]);
  return { dataCitaEmpalme5, fetchCitaEmpalme5 };
};
