import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";

export const useVentasOperacionesMediosPagos2 = ({ sucursal, folioVenta }) => {
  const [dataVentasOperacionesMediosPagos2, setDataVentasOperacionesMediosPagos2] = useState([]);

  const fetchVentasOperacionesMediosPagos2 = async () => {
    try {
      const response = await peinadosApi.get(`/sp_detalleVentasOperacionesMediosPagos2?sucursal=${sucursal}&folioVenta=${folioVenta}`);
      setDataVentasOperacionesMediosPagos2(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (folioVenta == 0 || !folioVenta) return;
    fetchVentasOperacionesMediosPagos2();
  }, [folioVenta]);
  return { dataVentasOperacionesMediosPagos2, fetchVentasOperacionesMediosPagos2 };
};
