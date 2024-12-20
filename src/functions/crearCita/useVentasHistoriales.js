import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";
import { format } from "date-fns-tz";

export const useVentasHistoriales = ({ userID, claveProd, sucursal, fechaInicio, fechaFin, idCliente }) => {
  const [dataVentasHistoriales, setDataVentasHistoriales] = useState([]);

  const fetchVentasHistoriales = async () => {
    try {
      const response = await peinadosApi.get(
        `/sp_detalleVentasHistorialSel2?UserID=${userID>0 ? userID : ""}&ClaveProd=${claveProd ? claveProd : ""}&Sucursal=${
          sucursal ? sucursal : ""
        }&FechaInicio=${fechaInicio ? fechaInicio : ""}&FechaFin=${fechaFin ? fechaFin : ""}&IdCliente=${idCliente}
`
      );
      setDataVentasHistoriales(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (idCliente == "" || !idCliente) return;
    fetchVentasHistoriales();
  }, [idCliente]);
  return { dataVentasHistoriales, fetchVentasHistoriales };
};
