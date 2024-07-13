import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Col, Row, InputGroup, Container } from "reactstrap";
import { peinadosApi } from "../api/peinadosApi";
import { startOfToday, setHours, parseISO, isValid } from "date-fns";
import { format } from "date-fns-tz";
import { MdOutlineDelete, MdFolderOpen, MdCalendarMonth } from "react-icons/md";
import Swal from "sweetalert2";
import { MaterialReactTable } from "material-react-table";
import { useListaEspera } from "../functions/listaEspera/useListaEspera";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useCitaEmpalme } from "../functions/crearCita/useCitaEmpalme4";
import { useHorarioDisponibleEstilistas6 } from "../functions/crearCita/useHorarioDisponibleEstilistas6";
import { AiFillDelete, AiFillEdit, AiOutlineClose, AiOutlineSearch, AiOutlineReload } from "react-icons/ai";
import { createTheme, ThemeProvider } from "@mui/material/styles";

function ListaEspera() {
  const [openListaEspera, setOpenListaEspera] = useState(false);

  const rows = [
    {
      id: 10,
      clave: "180",
      descripcion: "susy",
      precio: "10:00am",
      horaFinal: "12:00pm",
      servicio: "Peinados",
      tiempo: "30",
      total: "$5000.00",
    },
    {
      id: 11,
      clave: "181",
      estilista: "susy",
      hora: "2:00pm",
      horaFinal: "12:00pm",
      cliente: "Mario",
      servicio: "Corte",
      tiempo: "10",
      total: "$200.00",
    },
  ];

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  const [clientesModal, setClientesModal] = useState(false);
  const [productosModal, setProductosModal] = useState(false);
  const [productosModalLectura, setProductosModalLectura] = useState(false);
  const [estilistasModal, setEstilistasModal] = useState(false);
  const [modalCitaServicio, setModalCitaServicio] = useState(false);

  const [dataClientes, setDataClientes] = useState({});
  const [dataEstilistas, setDataEstilistas] = useState({});
  const [dataProductos, setDataProductos] = useState({});

  const [formClienteEspera, setformClienteEspera] = useState({
    id: "",
    sucursal: "",
    no_cliente: "",
    descripcion_no_cliente: "",
    fecha: new Date(),
    clave_prod: 0,
    descripcion_clave_prod: "",
    hora_estimada: 0,
    atendido: 0,
    estilista: "",
    estilista_descripcion: "",
    tiempo_servicio: 0,
    usuario_registra: 0,
    usuario_cita: 0,
    usuario_servicio: 0,
    usuario_elimina: 0,
    precio: 0,
    esEdicion: false,
  });
  useEffect(() => {
    getClientes();
    getEstilistas();
    getProductos();
  }, []);
  const { dataListaEspera, fetchListaEspera } = useListaEspera({ id: 0, sucursal: 1 });
  const getClientes = () => {
    peinadosApi.get("/clientes?id=0").then((response) => {
      setDataClientes(response.data);
    });
  };

  const getEstilistas = () => {
    peinadosApi.get("/estilistas?id=0").then((response) => {
      setDataEstilistas(response.data);
    });
  };
  const getProductos = () => {
    peinadosApi
      .get("/sp_cPSEAC?id=0&cia=1&sucursal=2&almacen=1&marca=%&descripcion=%&verinventariable=0&esServicio=2&esInsumo=0&obsoleto=0")
      .then((response) => {
        setDataProductos(response.data);
      });
  };
  const { dataCitaEmpalme, fetchCitaEmpalme } = useCitaEmpalme({
    fechacita: new Date(),
    no_estilista: 40,
    tiempoCita: 40,
  });
  const { dataHorarioDisponibleEstilistas, fetchHorarioDisponibleEstilistas } = useHorarioDisponibleEstilistas6({
    fecha: new Date(),
    cveEmpleado: 40,
    tiempo: 40,
  });
  const columnsClientes2 = useMemo(() => [
    {
      accessorKey: "acciones",
      header: "Acción",
      size: 100,
      Cell: ({ cell }) => (
        <div>
          <Button
            variant={"contained"}
            onClick={() => {
              setformClienteEspera({ ...formClienteEspera, no_cliente: cell.row.original.id, descripcion_no_cliente: cell.row.original.nombre });
              setClientesModal(false);
            }}
          >
            Agregar
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      size: 100,
    },
    {
      accessorKey: "telefono",
      header: "Telefono",
      size: 100,
    },
    {
      accessorKey: "celular",
      header: "Celular",
      size: 100,
    },
    {
      accessorKey: "cumpleaños",
      header: "Cumpleaños",
      size: 100,
      Cell: ({ cell }) => {
        const fechaCompleta1 = cell.row.original.cumpleaños;
        const fechaFormateada1 = fechaCompleta1 ? formatFecha(fechaCompleta1) : "";

        return <span>{fechaFormateada1}</span>;
      },
    },
  ]);

  const formatFecha = (fechaCompleta1) => {
    try {
      const fecha = parseISO(fechaCompleta1);
      if (isValid(fecha)) {
        return format(fecha, "dd/MM");
      }
      return "Fecha inválida";
    } catch (error) {
      console.error("Error al formatear la fecha:", error);
      return "Error";
    }
  };

  function validarContraseña() {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: "Ingrese su contraseña",
        input: "password",
        inputAttributes: {
          autocapitalize: "off",
        },
        customClass: {
          popup: "swal2-popup", // Agrega una clase personalizada al cuadro de diálogo
        },
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        showLoaderOnConfirm: true,
        preConfirm: (contraseña) => {
          // Aquí puedes agregar tu lógica de validación de contraseña
          // Por ejemplo, podrías comparar la contraseña ingresada con una contraseña almacenada o realizar una llamada a una API para verificar la contraseña
          return new Promise((resolve) => {
            setTimeout(() => {
              // Supongamos que la contraseña es "password"
              if (contraseña === "1234") {
                resolve();
              } else {
                Swal.fire({
                  icon: "error",
                  title: "Contraseña incorrecta",
                  text: "Por favor, ingrese una contraseña correcta.",
                  confirmButtonText: "Entendido",
                }).then((isConfirmed) => {
                  if (isConfirmed.isConfirmed) Swal.close();
                });
              }
            }, 2000);
          });
        },
        allowOutsideClick: () => !Swal.isLoading(),
      })
        .then((result) => {
          if (result.isConfirmed) {
            resolve(true); // Resuelve la promesa con valor true si la contraseña es correcta
          } else {
            resolve(false); // Resuelve la promesa con valor false si el usuario cancela la entrada de contraseña
          }
        })
        .catch((error) => {
          console.error(error);
          resolve(false); // Resuelve la promesa con valor false si ocurre algún error durante la validación de la contraseña
        });
    });
  }
  const columnsClientes = [
    { field: "nombre", headerName: "nombre", width: 250 },
    { field: "telefono", headerName: "telefono", width: 130 },
    { field: "celular", headerName: "celular", width: 130 },
    { field: "cumpleaños", headerName: "cumpleaños", width: 150, renderCell: (params) => <p>{params.row.cumpleaños}</p> },
    { field: "edit", headerName: "edit", renderCell: renderButtonClient, width: 130 },
  ];

  function renderButtonClient(params) {
    return (
      <div>
        <Button
          variant={"contained"}
          onClick={() => {
            setformClienteEspera({ ...formClienteEspera, no_cliente: params.row.id, descripcion_no_cliente: params.row.nombre });
            setClientesModal(false);
          }}
        >
          Agregar
        </Button>
      </div>
    );
  }
  function renderButtonProduct(params) {
    return (
      <div>
        <Button
          variant={"contained"}
          onClick={() => {
            setformClienteEspera({
              ...formClienteEspera,
              tiempo_servicio: params.row.tiempox,
              descripcion_clave_prod: params.row.descripcion,
              clave_prod: params.row.id,
              precio: params.row.precio_lista,
            });
            console.log(params.row);
            setProductosModal(false);
          }}
        >
          Agregar
        </Button>
      </div>
    );
  }
  function renderButtonEstilista(params) {
    return (
      <div>
        <Button
          variant={"contained"}
          onClick={() => {
            setformClienteEspera({ ...formClienteEspera, estilista: params.row.id, estilista_descripcion: params.row.estilista });
            setEstilistasModal(false);
          }}
        >
          Agregar
        </Button>
      </div>
    );
  }

  async function verificarDisponibilidad(tiempo, fecha, estilista) {
    const res = await fetchCitaEmpalme(tiempo, fecha, estilista);
    const resHorario = await fetchHorarioDisponibleEstilistas(fecha, estilista, tiempo);
    let isConfirmed2; // Declaración de la variable antes del primer if

    if (res && res.data[0].id > 0) {
      const isConfirmed = await Swal.fire({
        icon: "error",
        title: "Error",
        text: "El estilista no tiene horario disponible, empalme.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
        showConfirmButton: true,
        showCancelButton: true,
      });

      return isConfirmed.value;
    } else {
      if (resHorario) {
        if (resHorario.data[0].clave_empleado == "Cita sin restricciones" || resHorario.data[0].clave_empleado == "Prosiga") {
          return true;
        } else {
          isConfirmed2 = await Swal.fire({
            icon: "error",
            title: "Error",
            text: `El estilista no tiene horario disponible`,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Quiere continuar?",
            showConfirmButton: true,
            showCancelButton: true,
          });
        }
      }
      return isConfirmed2.value;
    }
  }

  const listaEsperaPost = async (idListaEspera, tipo, tiempo, estilista, fecha) => {
    const isVerified = await verificarDisponibilidad(tiempo, fecha, estilista);
    if (!isVerified) return;

    const contraseñaValidada = await validarContraseña();

    if (contraseñaValidada) {
      if ((estilista = 0 || !estilista)) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Debe seleccionar un estilista",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Entendido",
        });
        return;
      }
      peinadosApi
        .post("/sp_listaEsperaAdd3", null, {
          params: {
            sucursal: formClienteEspera.sucursal ? formClienteEspera.sucursal : 1,
            idListaEspera: idListaEspera,
            tipo: tipo,
          },
        })
        .then((response) => {
          Swal.fire({
            icon: "success",
            title: "Listo!",
            text: "Se creo exitosamente.",
            confirmButtonText: "Entendido",
          });
          fetchListaEspera();
          console.log(response);
        });
    }
  };
  const [formListaEsperaVerificacion, setFormListaEsperaVerificacion] = useState();
  function renderDeleteListaEspera(params) {
    return (
      <div>
        <MdCalendarMonth
          onClick={() => {
            listaEsperaPost(params.row.id, 1, params.row.tiempo_servicio, params.row.estilista, new Date(params.row.hora_estimada));
          }}
          title="C"
          size={25}
        />

        <MdFolderOpen
          title="S"
          size={25}
          onClick={() => {
            console.log(params.row);

            setModalCitaServicio(true);
            setFormListaEsperaVerificacion({
              id: params.row.id,
              fecha: params.row.fecha,
              estilista: params.row.estilista,
              estilista_descripcion: params.row.nombreEstilsta,
              servicio_descripcion: params.row.descripcion,
              cliente_descripcion: params.row.nombreCompleto,
              hora_estimada: params.row.hora_estimada,
              max_detalle_venta_id: params.row.max_detalle_venta_id,
              tiempo: params.row.tiempo_servicio,
            });
            // listaEsperaPost(params.row.id, 2);
          }}
        />
        <AiFillEdit
          size={25}
          onClick={() => {
            setOpenListaEspera(true);
            setformClienteEspera({
              id: params.row.id,
              estilista: params.row.estilista,
              estilista_descripcion: params.row.nombreEstilsta,
              descripcion_no_cliente: params.row.nombreCompleto,
              descripcion_clave_prod: params.row.descripcion,
              hora_estimada: params.row.hora_estimada,
              max_detalle_venta_id: params.row.max_detalle_venta_id,
              tiempo_servicio: params.row.tiempo_servicio,
              fecha: new Date(params.row.hora_estimada),
              sucursal: params.row.sucursal,
              sucursal_descripcion: params.row.sucursal_descripcion,
              observacion: params.row.observacion,
              no_cliente: params.row.no_cliente,
              clave_prod: params.row.clave_prod,
              usuario_registra: 49,
              usuario_servicio: 49,
              precio: params.row.max_detalle_venta_id,
              esEdicion: true,
            });
          }}
        ></AiFillEdit>
        <MdOutlineDelete
          title="Eliminar lista de espera"
          size={25}
          onClick={async () => {
            const contraseñaValidada = await validarContraseña();
            if (!contraseñaValidada) return;
            Swal.fire({
              title: "ADVERTENCIA",
              text: `¿Está seguro que desea eliminar esta lista de espera del cliente: ${params.row.nombreCompleto}?`,
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              confirmButtonText: "Sí, eliminar",
            }).then((result) => {
              if (result.isConfirmed) {
                peinadosApi.delete(`/ListaEspera2?id=${params.id}&usuario=${10}`).then(() => {
                  Swal.fire({
                    icon: "success",
                    text: "Registro eliminado con éxito",
                    confirmButtonColor: "#3085d6",
                  });
                  fetchListaEspera();
                  // getDescuento();
                });
              }
            });
          }}
        />
      </div>
    );
  }

  const columnsProductos = [
    { field: "x", headerName: "x", renderCell: renderButtonProduct, width: 130 },
    // { field: "clave_prod", headerName: "Clave_prod", width: 130 },
    { field: "descripcion", headerName: "Descripcion", width: 250 },
    { field: "precio_lista", headerName: "Precio", width: 130, renderCell: (params) => <p>{params.row.precio}</p> },
    { field: "tiempox", headerName: "Tiempo", width: 130, renderCell: (params) => <p>{params.row.tiempox}</p> },
  ];

  const columnsProductosMRT = useMemo(() => [
    {
      accessorKey: "acciones",
      header: "Acción",
      size: 100,
      Cell: ({ cell }) => (
        <div>
          <Button
            variant={"contained"}
            onClick={() => {
              setformClienteEspera({
                ...formClienteEspera,
                tiempo_servicio: cell.row.original.tiempox,
                descripcion_clave_prod: cell.row.original.descripcion,
                clave_prod: cell.row.original.id,
                precio: cell.row.original.precio_lista,
              });
              setProductosModal(false);
            }}
          >
            Agregar
          </Button>
        </div>
      ),
    },

    {
      accessorKey: "descripcion",
      header: "Descripcion",
      size: 100,
    },
    {
      accessorKey: "tiempox",
      header: "Tiempo",
      size: 100,
      Cell: ({ cell }) => <p className="centered-cell">{cell.row.original.tiempox + " min"}</p>,
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      accessorKey: "precio_lista",
      header: "Precio",
      size: 100,
      Cell: ({ cell }) => (
        <p className="centered-cell">{Number(cell.row.original.precio).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</p>
      ),
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    // {
    //   accessorKey: "precioPromocion",
    //   header: "Precio",
    //   size: 100,
    //   Cell: ({ cell }) => (
    //     <p className="centered-cell">{Number(cell.row.original.precioPromocion).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</p>
    //   ),
    //   className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    // },
  ]);

  const columnsEstilistas = [
    // { field: "cia", headerName: "cia", width: 250 },
    // { field: "sucursal", headerName: "sucursal", width: 130 },
    { field: "pr", headerName: "accion", renderCell: renderButtonEstilista, width: 90 },
    { field: "estilista", headerName: "estilista", width: 130, renderCell: (params) => <p>{params.row.estilista}</p> },
    //{ field: "tc", headerName: "tc", width: 130, renderCell: (params) => <input type="checkbox" value={params.row.tc} disabled /> },
  ];
  const columnListaEspera = [
    { field: "Accion", headerName: "Accion", renderCell: renderDeleteListaEspera, width: 130 },

    {
      field: "fecha",
      headerName: "hora",
      width: 90,
      renderCell: (params) => <p className="centered-cell"> {format(new Date(params.row.fecha), "p")}</p>,
    },
    { field: "nombreCompleto", headerName: "Nombre completo", width: 280 },
    { field: "descripcion", headerName: "Servicio", width: 280, renderCell: (params) => <p className="centered-cell">{params.row.descripcion}</p> },
    { field: "tiempo_servicio", headerName: "T", width: 45 },
    {
      field: "hora_estimada",
      headerName: "H_estimado",
      width: 100,
      renderCell: (params) => <p className="centered-cell">{format(new Date(params.row.hora_estimada), "p")}</p>,
    },
    { field: "nombreEstilsta", headerName: "Estilista", width: 90 },
    { field: "observacion", headerName: "Observacion", width: 500 },
  ];
  const putListaEspera = (id) => {
    console.log(formClienteEspera.no_cliente);
    console.log(formClienteEspera.clave_prod);
    console.log(formClienteEspera.hora_estimada);
    console.log(formClienteEspera.estilista);
    if (
      formClienteEspera.no_cliente == null ||
      formClienteEspera.clave_prod == null ||
      formClienteEspera.hora_estimada == null ||
      formClienteEspera.estilista == null ||
      !formClienteEspera.no_cliente ||
      !formClienteEspera.clave_prod ||
      !formClienteEspera.hora_estimada ||
      !formClienteEspera.estilista
    ) {
      alert("Favor de ingresar todos los datos esperados");
      return;
    }
    peinadosApi
      .put("/sp_catListaEsperaUpd5", null, {
        params: {
          id: formClienteEspera.id,
          sucursal: 1,
          no_cliente: formClienteEspera.no_cliente,
          clave_prod: formClienteEspera.clave_prod,
          hora_estimada: formClienteEspera.hora_estimada,
          estilista: formClienteEspera.estilista,
          tiempo_servicio: formClienteEspera.tiempo_servicio,
          usuario_registra: 1,
          usuario_servicio: 0,
          precio: formClienteEspera.precio,
          observacion: formClienteEspera.observacion ? formClienteEspera.observacion : "",
        },
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          text: "Lista de espera creado con información",
        });
        fetchListaEspera();
      });
  };
  const postListaEspera = () => {
    if (
      formClienteEspera.no_cliente == null ||
      formClienteEspera.clave_prod == null ||
      formClienteEspera.hora_estimada == null ||
      !formClienteEspera.no_cliente ||
      !formClienteEspera.clave_prod ||
      !formClienteEspera.hora_estimada
    ) {
      alert("Favor de ingresar todos los datos esperados");
      return;
    } else {
      peinadosApi.post("/ListaEspera", null, {
        params: {
          sucursal: 1,
          no_cliente: formClienteEspera.no_cliente,
          fecha: new Date(),
          clave_prod: formClienteEspera.clave_prod,
          hora_estimada: formClienteEspera.hora_estimada,
          atendido: 1,
          estilista: formClienteEspera.estilista ? formClienteEspera.estilista : "",
          tiempo_servicio: formClienteEspera.tiempo_servicio,
          usuario_registra: 1,
          usuario_cita: formClienteEspera.no_cliente,
          usuario_servicio: 0,
          usuario_elimina: 0,
          precio: formClienteEspera.precio,
          observacion: formClienteEspera.observacion ? formClienteEspera.observacion : "",
        },
      });
    }
    Swal.fire({
      icon: "success",
      text: "Lista de espera creado con información",
    });
    fetchListaEspera();
  };
  const timeZone = "America/Mexico_City"; // Ajusta esto a tu zona horaria
  const closeOpenListaEspera = () => {
    setOpenListaEspera(false);
    if (!formClienteEspera.esEdicion) return;
    const defaultValues = {
      id: null,
      sucursal: null,
      no_cliente: null,
      descripcion_no_cliente: null,
      fecha: null,
      clave_prod: null,
      descripcion_clave_prod: null,
      hora_estimada: null,
      atendido: null,
      estilista: null,
      estilista_descripcion: null,
      tiempo_servicio: null,
      usuario_registra: null,
      usuario_cita: null,
      usuario_servicio: null,
      usuario_elimina: null,
      precio: null,
      esEdicion: false,
    };
    setformClienteEspera(defaultValues);
  };
  const theme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            "& .MuiDataGrid-cell": {
              fontSize: "16px", // Cambia el tamaño de la fuente aquí
            },
            "& .MuiDataGrid-columnHeaders": {
              fontSize: "16px", // Cambia el tamaño de la fuente de los encabezados aquí
            },
          },
        },
      },
    },
  });
  return (
    <>
      <Container>
        <h1>Lista de espera</h1>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "end" }}>
          <Button
            style={{ marginBottom: "10px" }}
            color="success"
            onClick={() => {
              setOpenListaEspera(true);
              setformClienteEspera({ ...formClienteEspera, esEdicion: false });
            }}
          >
            Agregar Lista de espera
          </Button>
        </div>
      </Container>
      <ThemeProvider theme={theme}>
        <DataGrid rows={dataListaEspera} columns={columnListaEspera} />
      </ThemeProvider>
      <Modal isOpen={openListaEspera} toggle={() => closeOpenListaEspera()} size="xl">
        <ModalHeader toggle={() => closeOpenListaEspera()}>
          {formClienteEspera.esEdicion ? "Edicion	de lista de espera" : "Agregar Lista de espera"}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="cliente">
                  Cliente
                </Label>
                <InputGroup>
                  <Input
                    style={{ fontSize: "1.2rem" }}
                    value={formClienteEspera.descripcion_no_cliente}
                    type="text"
                    name="cliente"
                    id="cliente"
                    disabled
                  />
                  <Button onClick={() => setClientesModal(true)}>Agregar</Button>
                </InputGroup>
              </FormGroup>

              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="cliente">
                  Estilista
                </Label>
                <InputGroup>
                  <Input
                    style={{ fontSize: "1.2rem" }}
                    value={formClienteEspera.estilista_descripcion}
                    type="text"
                    name="estilista"
                    id="estilista"
                    disabled
                  />
                  <Button onClick={() => setEstilistasModal(true)}>Agregar</Button>
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="horaEstimada">
                  Hora estimada
                </Label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    style={{ fontSize: "1.2rem" }}
                    ampm={true} // Si quieres formato de 24 horas
                    timeSteps={{ minutes: 15 }}
                    value={formClienteEspera.hora_estimada ? new Date(decodeURIComponent(formClienteEspera.hora_estimada)) : null}
                    onChange={(newTime) => {
                      if (newTime) {
                        const now = new Date();
                        now.setHours(newTime.getHours(), newTime.getMinutes(), 0, 0);
                        setformClienteEspera({ ...formClienteEspera, hora_estimada: now.toISOString() });
                      } else {
                        setformClienteEspera({ ...formClienteEspera, hora_estimada: null });
                      }
                    }}
                    renderInput={(params) => (
                      <Input
                        {...params}
                        size="small"
                        style={{
                          fontSize: "1.2rem",
                          backgroundColor: "#ffccac",
                        }}
                      />
                    )}
                    sx={{
                      "& .MuiInputBase-input": {
                        height: "60%",
                      },
                      "& .MuiPickersDay-dayWithMargin": {
                        display: "none",
                      },
                      "& .MuiSvgIcon-root": {
                        width: "0.8rem",
                        backgroundColor: "#ffccac",
                      },
                    }}
                  />
                </LocalizationProvider>
                {/* <Input
      type="time"
      name="hora_estimada"
      id="hora_estimada"
      onChange={(param) => {
        const now = new Date();
        const [hours, minutes] = param.target.value.split(":").map(Number);
        now.setHours(hours, minutes, 0); // Asume que los segundos y milisegundos son 0
        setformClienteEspera({ ...formClienteEspera, hora_estimada: now });
      }}
    /> */}
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="productoServicio">
                  Producto/Servicio
                </Label>
                <InputGroup>
                  <Input
                    style={{ fontSize: "1.2rem" }}
                    type="text"
                    name="productoServicio"
                    id="productoServicio"
                    disabled
                    value={formClienteEspera.descripcion_clave_prod}
                  />
                  <Button
                    onClick={() => {
                      setProductosModal(true);
                    }}
                  >
                    Agregar
                  </Button>
                </InputGroup>
              </FormGroup>{" "}
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="tiempoServicio">
                  Tiempo de servicio
                </Label>
                <Input
                  disabled={!formClienteEspera.esEdicion}
                  style={{ fontSize: "1.2rem" }}
                  type="text"
                  name="tiempoServicio"
                  id="tiempoServicio"
                  value={formClienteEspera.tiempo_servicio}
                  onChange={(event) => {
                    setformClienteEspera({ ...formClienteEspera, tiempo_servicio: event.target.value });
                  }}
                />
              </FormGroup>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="observacion">
                  Observacion
                </Label>
                <Input
                  style={{ fontSize: "1.2rem" }}
                  type="text"
                  name="tiempoServicio"
                  id="tiempoServicio"
                  value={formClienteEspera.observacion}
                  onChange={(event) => {
                    setformClienteEspera({ ...formClienteEspera, observacion: event.target.value });
                  }}
                />
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              if (!formClienteEspera.esEdicion) postListaEspera();
              else putListaEspera();

              setOpenListaEspera(!openListaEspera);
              setformClienteEspera([]);
            }}
          >
            Agregar
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={clientesModal} toggle={() => setClientesModal(!clientesModal)} centered size="xl">
        <ModalHeader toggle={() => setClientesModal(!clientesModal)}>Agregar cliente</ModalHeader>
        <ModalBody>
          {/* <DataGrid rows={dataClientes} columns={columnsClientes} /> */}

          <MaterialReactTable
            columns={columnsClientes2}
            data={dataClientes}
            initialState={{ density: "compact" }}
            muiTableContainerProps={{ sx: { maxHeight: "350px" } }}
            muiTableBodyProps={{ sx: { fontSize: "16px" } }}
            muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
            muiTableBodyCellProps={{
              sx: {
                fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
              },
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setClientesModal(!clientesModal)}>
            Agregar
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={productosModal} toggle={() => setProductosModal(!productosModal)} size="xl" centered>
        <ModalHeader toggle={() => setProductosModal(!productosModal)}>Agregar producto</ModalHeader>
        <ModalBody>
          {/* <DataGrid rows={dataProductos} columns={columnsProductosMRT} /> */}
          <MaterialReactTable
            columns={columnsProductosMRT}
            data={dataProductos}
            initialState={{ density: "compact" }}
            muiTableContainerProps={{ sx: { maxHeight: "330px" } }}
            muiTableBodyProps={{ sx: { fontSize: "16px" } }}
            muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
            muiTableBodyCellProps={{
              sx: {
                fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
              },
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setProductosModal(!productosModal)}>
            Agregar
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={estilistasModal} toggle={() => setEstilistasModal(!estilistasModal)} size="xl">
        <ModalHeader toggle={() => setEstilistasModal(!estilistasModal)}>Agregar estilista</ModalHeader>
        <ModalBody>
          <ThemeProvider theme={theme}>
            <DataGrid rows={dataEstilistas} columns={columnsEstilistas} />
          </ThemeProvider>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={() => setEstilistasModal(!estilistasModal)}>
            Agregar
          </Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={modalCitaServicio} toggle={() => setModalCitaServicio(!modalCitaServicio)} size="xl">
        <ModalHeader toggle={() => setModalCitaServicio(!modalCitaServicio)}>Folio y Hora</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label style={{ fontSize: "1.2rem" }}>Cliente</Label>
            <Input style={{ fontSize: "1.2rem" }} disabled type="text" value={formListaEsperaVerificacion?.cliente_descripcion}></Input>
          </FormGroup>
          <FormGroup>
            <Label style={{ fontSize: "1.2rem" }}> Estilista</Label>
            <Input style={{ fontSize: "1.2rem" }} disabled type="text" value={formListaEsperaVerificacion?.estilista_descripcion}></Input>
          </FormGroup>
          <FormGroup row>
            <Col sm={12}>
              <Label style={{ fontSize: "1.2rem" }}>Servicio</Label>
            </Col>
            <Col sm={12}>
              <Input style={{ fontSize: "1.2rem" }} disabled type="text" value={formListaEsperaVerificacion?.servicio_descripcion}></Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm={12}>
              <Label style={{ fontSize: "1.2rem" }}>Hora</Label>
            </Col>
            <Col sm={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  slotProps={{ textField: { size: "small" } }}
                  disabled
                  value={formListaEsperaVerificacion?.hora_estimada ? parseISO(formListaEsperaVerificacion.hora_estimada) : null}
                  inputFormat="HH:mm"
                  renderInput={(params) => <TextField {...params} style={{ fontSize: "1.2rem", height: "4rem" }} />}
                />
              </LocalizationProvider>
            </Col>
          </FormGroup>
          {/* <FormGroup>
      <Label>Folio</Label>
      <Input disabled type="text" value={formListaEsperaVerificacion?.max_detalle_venta_id}></Input>
    </FormGroup> */}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              //listaEsperaPost(formListaEsperaVerificacion.id, 2);
              listaEsperaPost(
                formListaEsperaVerificacion.id,
                2,
                formListaEsperaVerificacion.tiempo,
                formListaEsperaVerificacion.estilista,
                new Date(formListaEsperaVerificacion.hora_estimada)
              );

              setModalCitaServicio(!modalCitaServicio);
            }}
          >
            Agregar
          </Button>
          <Button color="danger" onClick={() => setModalCitaServicio(!modalCitaServicio)}>
            Salir
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default ListaEspera;
