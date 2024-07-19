import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";
import { format } from "date-fns-tz";

export const useProductosAreaDeptoSub = () => {
  const [dataProductosAreaDeptoSub, setDataProductosAreaDeptoSub] = useState([]);

  const fetchProductosAreaDeptoSub = async (
    id,
    cia,
    sucursal,
    almacen,
    marca,
    descripcion,
    verinventariable,
    esServicio,
    esInsumo,
    obsoleto,
    area,
    depto,
    subdepto
  ) => {
    try {
      const response = await peinadosApi.get(
        `/sp_cPSEAC2?id=${id}&cia=${cia}&sucursal=${sucursal}&almacen=${almacen}&marca=${marca}&descripcion=${descripcion}&verinventariable=${verinventariable}
        &esServicio=${esServicio}&esInsumo=${esInsumo}&obsoleto=${obsoleto}&area=${area == 0 ? 0 : area}&depto=${depto == 0 ? 0 : depto}&subdepto=${
          subdepto == 0 ? 0 : subdepto
        }`
      );
      setDataProductosAreaDeptoSub(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  return { dataProductosAreaDeptoSub, fetchProductosAreaDeptoSub, setDataProductosAreaDeptoSub };
};
