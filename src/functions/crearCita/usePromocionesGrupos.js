import { useEffect, useState } from "react";
import { peinadosApi } from "../../api/peinadosApi";

export const usePromocionesGrupos = ({ idPromocion }) => {
  const [dataPromocionesGrupos, setDataPromocionesGrupos] = useState([]);

  const fetchPromocionesGrupos = async () => {
    try {
      const response = await peinadosApi.get(`/catPromocionesGrupos?idPromocion=${idPromocion}`);
      setDataPromocionesGrupos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!idPromocion) return;
    fetchPromocionesGrupos();
  }, [idPromocion]);

  return { dataPromocionesGrupos, fetchPromocionesGrupos };
};
