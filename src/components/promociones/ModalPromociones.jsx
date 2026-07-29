import React, { useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import Swal from "sweetalert2";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Alert,
  Button,
  Input,
  InputGroup,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
} from "reactstrap";
import "./ModalPromociones.css";

const formatFecha = (fechaCompleta) => {
  try {
    const fecha = parseISO(fechaCompleta);
    if (isValid(fecha)) {
      return format(fecha, "dd/MM/yyyy");
    }
    return "Fecha inválida";
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return "Error";
  }
};

const obtenerIdPromocion = (promocion) => promocion.idPromocion || promocion.id;

export const ModalPromociones = ({
  isOpen,
  onClose,
  onSelectProducto,
  api,
  cia,
  sucursal,
  almacen = 11,
  soloVisual = false,
  zIndex = 1400,
}) => {
  const [dataPromo, setDataPromo] = useState([]);
  const [promocionAbierta, setPromocionAbierta] = useState("");
  const [grupoAbierto, setGrupoAbierto] = useState("");
  const [gruposPorPromocion, setGruposPorPromocion] = useState({});
  const [productosPorGrupo, setProductosPorGrupo] = useState({});
  const [filtrosProductos, setFiltrosProductos] = useState({});
  const [cargandoPromocion, setCargandoPromocion] = useState(null);
  const [cargandoGrupo, setCargandoGrupo] = useState(null);

  const cargarPromociones = async () => {
    try {
      const response = await api.get(`/PromoSucursalesRegionVigente?idSuc=${sucursal}`);
      setDataPromo(response.data || []);
    } catch (error) {
      console.error("Error al obtener las promociones vigentes:", error);
      Swal.fire("Error", "No fue posible cargar las promociones vigentes.", "error");
    }
  };

  useEffect(() => {
    if (isOpen) void cargarPromociones();
  }, [isOpen]);

  const cerrarModal = () => {
    setPromocionAbierta("");
    setGrupoAbierto("");
    setGruposPorPromocion({});
    setProductosPorGrupo({});
    setFiltrosProductos({});
    setCargandoPromocion(null);
    setCargandoGrupo(null);
    onClose();
  };

  const togglePromocionAcordeon = async (promocion) => {
    const idPromocion = obtenerIdPromocion(promocion);
    const llave = String(idPromocion);

    if (promocionAbierta === llave) {
      setPromocionAbierta("");
      return;
    }

    setPromocionAbierta(llave);
    setGrupoAbierto("");

    if (!gruposPorPromocion[idPromocion]) {
      setCargandoPromocion(idPromocion);
      try {
        const response = await api.get(`/catPromocionesGrupos?idPromocion=${idPromocion}`);
        setGruposPorPromocion((anteriores) => ({
          ...anteriores,
          [idPromocion]: response.data || [],
        }));
      } catch (error) {
        console.error("Error al obtener los renglones de la promoción:", error);
        Swal.fire("Error", "No fue posible cargar el detalle de la promoción.", "error");
      } finally {
        setCargandoPromocion(null);
      }
    }
  };

  const toggleGrupoAcordeon = async (grupo) => {
    const llave = String(grupo.id);

    if (grupoAbierto === llave) {
      setGrupoAbierto("");
      return;
    }

    setGrupoAbierto(llave);
    if (!productosPorGrupo[grupo.id]) {
      setCargandoGrupo(grupo.id);
      try {
        const response = await api.get(
          `/sp_cPSEACPromo?id=0&cia=${cia}&sucursal=${sucursal}&almacen=${almacen}&idProducto=${grupo.idProducto}&area=${grupo.idArea}&depto=${grupo.idDepto}&subdepto=${grupo.idSubdepto}`
        );
        setProductosPorGrupo((anteriores) => ({
          ...anteriores,
          [grupo.id]: response.data || [],
        }));
      } catch (error) {
        console.error("Error al obtener los productos de la promoción:", error);
        Swal.fire("Error", "No fue posible cargar las claves de producto.", "error");
      } finally {
        setCargandoGrupo(null);
      }
    }
  };

  const handleSeleccionarProducto = (producto) => {
    cerrarModal();
    if (onSelectProducto) onSelectProducto(producto);
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={cerrarModal}
      zIndex={zIndex}
      className="modal-promociones"
      style={{ width: "100vw", maxWidth: "100vw", margin: "0 auto", minHeight: "90vh" }}
    >
      <ModalHeader toggle={cerrarModal}>
        <h3>Promociones disponibles</h3>
      </ModalHeader>
      <ModalBody>
        <p className="text-muted mb-3">
          {soloVisual
            ? "Abre una promoción y después el renglón de clasificación para consultar las claves participantes."
            : "Abre una promoción, después el renglón de clasificación y selecciona la clave que deseas agregar a la venta."}
        </p>
        {dataPromo.length === 0 ? (
          <Alert color="info">No hay promociones vigentes para esta sucursal.</Alert>
        ) : (
          <Accordion
            open={promocionAbierta}
            toggle={(targetId) => {
              const promocion = dataPromo.find((item) => String(obtenerIdPromocion(item)) === targetId);
              if (promocion) void togglePromocionAcordeon(promocion);
            }}
          >
            {dataPromo.map((promocion) => {
              const idPromocion = obtenerIdPromocion(promocion);
              const grupos = gruposPorPromocion[idPromocion] || [];

              return (
                <AccordionItem key={idPromocion}>
                  <AccordionHeader targetId={String(idPromocion)}>
                    <div className="d-flex flex-wrap align-items-center gap-3 w-100 pe-3">
                      <strong>{promocion.descripcionPromo}</strong>
                      <small className="text-muted">
                        {formatFecha(promocion.f1)} al {formatFecha(promocion.f2)}
                      </small>
                      <span className="badge bg-success">{promocion.vigencia || "Vigente"}</span>
                    </div>
                  </AccordionHeader>
                  <AccordionBody accordionId={String(idPromocion)}>
                    {cargandoPromocion === idPromocion ? (
                      <div className="text-center py-3">Cargando clasificaciones...</div>
                    ) : grupos.length === 0 ? (
                      <Alert color="warning">Esta promoción no tiene renglones configurados.</Alert>
                    ) : (
                      <Accordion
                        open={grupoAbierto}
                        toggle={(targetId) => {
                          const grupo = grupos.find((item) => String(item.id) === targetId);
                          if (grupo) void toggleGrupoAcordeon(grupo);
                        }}
                      >
                        {grupos.map((grupo) => {
                          const productos = productosPorGrupo[grupo.id] || [];
                          const filtroProducto = filtrosProductos[grupo.id] || "";
                          const textoFiltro = filtroProducto.trim().toLocaleLowerCase("es-MX");
                          const productosFiltrados = textoFiltro
                            ? productos.filter((producto) => {
                                const valoresColumnas = [
                                  producto.id,
                                  producto.descripcion,
                                  producto.existencia,
                                  producto.precio,
                                  producto.tiempox,
                                ];

                                return valoresColumnas.some((valor) =>
                                  String(valor ?? "").toLocaleLowerCase("es-MX").includes(textoFiltro)
                                );
                              })
                            : productos;
                          return (
                            <AccordionItem key={grupo.id}>
                              <AccordionHeader targetId={String(grupo.id)}>
                                <div className="d-flex flex-wrap gap-3 w-100 pe-3">
                                  <span>
                                    <strong>Área:</strong> {grupo.d_area || "Todas"}
                                  </span>
                                  <span>
                                    <strong>Depto:</strong> {grupo.d_depto || "Todos"}
                                  </span>
                                  <span>
                                    <strong>Subdepto:</strong> {grupo.d_subdepto || "Todos"}
                                  </span>
                                  <span>
                                    <strong>Producto:</strong> {grupo.d_producto || "Todos"}
                                  </span>
                                  <span className="text-success">
                                    <strong>Descuento:</strong> {Math.trunc(grupo.descuentoPorcentaje * 100)}%
                                  </span>
                                </div>
                              </AccordionHeader>
                              <AccordionBody accordionId={String(grupo.id)}>
                                {cargandoGrupo === grupo.id ? (
                                  <div className="text-center py-3">Cargando claves de producto...</div>
                                ) : productos.length === 0 ? (
                                  <Alert color="warning">No se encontraron claves para esta clasificación.</Alert>
                                ) : (
                                  <div>
                                    <InputGroup className="mb-3">
                                      <InputGroupText>Buscar</InputGroupText>
                                      <Input
                                        value={filtroProducto}
                                        onChange={(evento) =>
                                          setFiltrosProductos((anteriores) => ({
                                            ...anteriores,
                                            [grupo.id]: evento.target.value,
                                          }))
                                        }
                                        placeholder="Buscar en todas las columnas..."
                                        aria-label="Buscar en todas las columnas de productos"
                                      />
                                      {filtroProducto && (
                                        <Button
                                          color="secondary"
                                          outline
                                          onClick={() =>
                                            setFiltrosProductos((anteriores) => ({
                                              ...anteriores,
                                              [grupo.id]: "",
                                            }))
                                          }
                                        >
                                          Limpiar
                                        </Button>
                                      )}
                                    </InputGroup>

                                    {productosFiltrados.length === 0 ? (
                                      <Alert color="info" className="mb-0">
                                        No hay productos que coincidan con “{filtroProducto}”.
                                      </Alert>
                                    ) : (
                                      <div className="table-responsive">
                                        <Table hover size="sm" className="align-middle mb-0">
                                          <thead>
                                            <tr>
                                              <th>Clave</th>
                                              <th>Producto / servicio</th>
                                              <th>Existencia</th>
                                              <th>Precio</th>
                                              <th>Tiempo</th>
                                              {!soloVisual && <th></th>}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {productosFiltrados.map((producto) => (
                                              <tr key={producto.id}>
                                                <td>{producto.id}</td>
                                                <td>{producto.descripcion}</td>
                                                <td>{producto.existencia}</td>
                                                <td>
                                                  $
                                                  {Number(producto.precio || 0).toLocaleString("es-MX", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                  })}
                                                </td>
                                                <td>{producto.tiempox}</td>
                                                {!soloVisual && (
                                                  <td className="text-end">
                                                    <Button
                                                      color="primary"
                                                      size="sm"
                                                      onClick={() => handleSeleccionarProducto(producto)}
                                                    >
                                                      Seleccionar
                                                    </Button>
                                                  </td>
                                                )}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </Table>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </AccordionBody>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                    )}
                  </AccordionBody>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={cerrarModal}>
          Cerrar
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ModalPromociones;
