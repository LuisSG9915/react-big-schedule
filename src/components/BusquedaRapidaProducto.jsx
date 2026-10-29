import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { peinadosApi } from "../api/peinadosApi";

export default function BusquedaRapidaProducto({
  sucursal,
  cia = 1,
  almacen = 0,
  displayValue = "",
  onSelect,
  disabled = false,
  placeholder = "Nombre o código de barras",
}) {
  const [texto, setTexto] = useState(displayValue || "");
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setTexto(displayValue || "");
    setConsulta("");
  }, [displayValue]);

  useEffect(() => {
    const controller = new AbortController();
    setResultados([]);
    setError(false);
    if (!consulta.trim() || !sucursal || !cia) {
      setCargando(false);
      return () => controller.abort();
    }
    setCargando(true);
    const timer = window.setTimeout(async () => {
      try {
        const { data } = await peinadosApi.get("/sp_cPSEAC", {
          params: {
            id: 0,
            descripcion: consulta.trim(),
            verinventariable: 2,
            esServicio: 2,
            esInsumo: 0,
            obsoleto: 0,
            marca: "%",
            cia,
            sucursal,
            almacen,
          },
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResultados(Array.isArray(data) ? data : []);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [consulta, sucursal, cia, almacen]);

  return (
    <Autocomplete
      sx={{ flex: 1, minWidth: 0 }}
      size="small"
      disabled={disabled}
      options={resultados}
      filterOptions={(options) => options}
      getOptionLabel={(option) => option.descripcion || ""}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      value={null}
      inputValue={texto}
      loading={cargando}
      loadingText="Buscando productos..."
      noOptionsText={
        error
          ? "No fue posible buscar. Intenta de nuevo o usa el catálogo."
          : consulta.trim()
            ? "Sin coincidencias"
            : "Escribe un nombre o código de barras"
      }
      slotProps={{ popper: { style: { zIndex: 1600 } } }}
      onInputChange={(_, value, reason) => {
        if (reason === "input" || reason === "clear") {
          setTexto(value);
          setConsulta(value);
        }
      }}
      onChange={(_, producto) => {
        if (producto) {
          setConsulta("");
          setTexto(displayValue || "");
          onSelect?.(producto);
        }
      }}
      onBlur={() => {
        setTexto(displayValue || "");
        setConsulta("");
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          inputProps={{ ...params.inputProps, "aria-label": "Buscar producto o servicio" }}
        />
      )}
      renderOption={(optionProps, producto) => (
        <li {...optionProps} key={producto.id}>
          <div style={{ width: "100%" }}>
            <div style={{ fontWeight: 600 }}>{producto.descripcion}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: "0.85rem" }}>
              <span>Existencia: {producto.existencia ?? 0}</span>
              <span>
                Precio:{" "}
                {Number(producto.precio || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
              </span>
              <span>Tiempo: {producto.tiempox ?? 0}</span>
            </div>
          </div>
        </li>
      )}
    />
  );
}
