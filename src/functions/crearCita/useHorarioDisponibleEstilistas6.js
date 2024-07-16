import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";
import { format } from "date-fns-tz";

export const useHorarioDisponibleEstilistas6 = ({ fecha, cveEmpleado, tiempo }) => {
  const [dataHorarioDisponibleEstilistas, setdataHorarioDisponibleEstilistas] = useState([]);

  const fetchHorarioDisponibleEstilistas = async (fechaFetch, estilistaFetch, tiempoFetch) => {
    try {
      const response = await peinadosApi.get(
        `/sp_horarioDisponibleEstilistas6?fechaDisponibilidad=${
          fechaFetch ? format(fechaFetch, "yyyy-MM-dd HH:mm") : format(fecha, "yyyy-MM-dd HH:mm")
        }&cveEmpleado=${estilistaFetch ? estilistaFetch : cveEmpleado}&tiempo=${tiempoFetch ? tiempoFetch : tiempo}`
      );
      setdataHorarioDisponibleEstilistas(response.data);
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (tiempo == "" || !tiempo || tiempo<=0) return;
    console.log(tiempo + 'TIEMPO EN USE HORARIOS')
    fetchHorarioDisponibleEstilistas();
  }, [tiempo]);
  return { dataHorarioDisponibleEstilistas, fetchHorarioDisponibleEstilistas };
};
