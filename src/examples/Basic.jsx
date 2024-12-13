import React, { useEffect, useMemo, useReducer, useState } from "react";
import * as dayjsLocale from "dayjs/locale/es-mx";
import * as antdLocale from "antd/locale/es_ES";
import { Scheduler, SchedulerData, ViewType, wrapperFun, DemoData } from "../index";
import { jezaApi } from "../api/jezaApi2";
import { peinadosApi } from "../api/peinadosApi";
// import Modal from "../components/Modal";
import { format, utcToZonedTime } from "date-fns-tz";
import { isToday } from "date-fns";
import { DataGrid } from "@mui/x-data-grid";
import Timer from "../components/Timer";
import {
  Container,
  Button,
  Badge,
  Label,
  Input,
  Col,
  Row,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  InputGroup,
  ButtonGroup,
  InputGroupText,
  Table,
} from "reactstrap";
import { FaMoneyBillAlt, FaTrash, FaBirthdayCake } from "react-icons/fa";
import { RiDiscountPercentLine } from "react-icons/ri";
import Swal from "sweetalert2";
import "../css/style.css";

import { es } from "date-fns/locale";
import { MdOutlineFolder, MdOutlinePriceCheck } from "react-icons/md";
import { MaterialReactTable } from "material-react-table";
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { startOfToday, setHours, parseISO, isValid } from "date-fns";
import { useDetalleCuentaPendietes } from "../functions/crearCita/useDetalleCuentaPendietes";
import { useDetalleCitasServicios } from "../functions/crearCita/useDetalleCitasServicios";
import { useDetalleSaldosPendientes } from "../functions/crearCita/useDetalleSaldosPendientes";
import { useVentasHistoriales } from "../functions/crearCita/useVentasHistoriales";
import { usesp_ClasificacionSel } from "../functions/crearCita/useDetalleSaldosPendientes copy";
import { useCitaEmpalme } from "../functions/crearCita/useCitaEmpalme4";
import { useCitaEmpalme5 } from "../functions/crearCita/useCitaEmpalme5";
import { useCumpleañosProximos } from "../functions/crearCita/useCumpleañosProximos";
import { useHorarioDisponibleEstilistas6 } from "../functions/crearCita/useHorarioDisponibleEstilistas6";
import { useVentasOperaciones } from "../functions/crearCita/useVentasOperaciones";
import { useSucursales } from "../functions/crearCita/useSucursales";
import { useNominaTrabajadores } from "../functions/crearCita/useNominaTrabajadores";
import { useDetalleCitasObservaciones } from "../functions/crearCita/useDetalleCitasObservaciones";
import { AiFillDelete, AiFillEdit, AiOutlineClose, AiOutlineSearch, AiOutlineReload, AiFillBook } from "react-icons/ai";
import { useObservaciones } from "../functions/crearCita/useObservaciones";
import { styled } from "@mui/material/styles";
import { Box, Typography, Modal, FormControlLabel, Checkbox, FormControl } from "@mui/material";
import Draggable from "react-draggable";
import debounce from "lodash.debounce";
import { IoIosAddCircle } from "react-icons/io";
import { IoListCircle } from "react-icons/io5";
import { FaEye } from "react-icons/fa6";
import { IoRefreshCircle } from "react-icons/io5";
import { usePromocionesZonas } from "../functions/crearCita/usePromocionesZonas";
import { usePromocionesGrupos } from "../functions/crearCita/usePromocionesGrupos";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useProductosAreaDeptoSub } from "../functions/crearCita/useProductosAreaDeptoSub";
import { usePrepagos } from "../functions/crearCita/usePrepagos";
import { useVentasOperacionesMediosPagos2 } from "../functions/crearCita/useVentasOperacionesMediosPagos2";

let schedulerData;

const initialState = {
  showScheduler: false,
  viewModel: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "INITIALIZE":
      return { showScheduler: true, viewModel: action.payload };
    case "UPDATE_SCHEDULER":
      return { ...state, viewModel: action.payload };
    case "REINITIALIZE":
      return { ...state, showScheduler: false };
    default:
      return state;
  }
}

function Basic() {
  const [dataEvent, setDataEvent] = useState({
    id: 0,
    event_id: "",
    title: "",
    description: "",
    start: new Date("20230713"),
    end: new Date("20230713"),
    admin_id: 0,
    color: "",
    horaFin: new Date("20230713"),
    fechaCita: new Date("20230713"),
    idUsuario: 0,
    cia: 0,
    sucursal: 0,
    d_sucursal: "",
    idCliente: 0,
    nombreCliente: "",
    tiempo: 0,
    idEstilista: 0,
    nombreEstilista: "",
    nombreRecepcionista: "",
    fechaAlta: "",
    estatus: 0,
    descripcionEstatus: "",
    fechaCambio: "",
    idcolor: 0,
    idEstatus: 0,
  });

  const idSuc = new URLSearchParams(window.location.search).get("idSuc");
  const suc = new URLSearchParams(window.location.search).get("suc");
  const idRec = new URLSearchParams(window.location.search).get("idRec");
  const fecha = new Date();
  // ?
  const idUser = new URLSearchParams(window.location.search).get("idRec");

  useEffect(() => {
    if (!idSuc) {
      alert("Favor de ingresar en la página principal");
      window.location.href = "http://cbinfo.no-ip.info:9020/";
    }
    setDataEvent({ ...dataEvent, sucursal: Number(idSuc), d_sucursal: suc, idRec: Number(idRec) });
  }, []);

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

  useEffect(() => {
    // Añadir la clase al body
    document.body.classList.add("special-body");

    // Quitar la clase del body cuando el componente se desmonte
    return () => {
      document.body.classList.remove("special-body");
    };
  }, []);

  const [clavePrepago, setClavePrepago] = useState(0);
  const [arreglo, setArreglo] = useState([]);

  const [arregloCitaDia, setArregloCitaDia] = useState([]);
  const [arregloCita, setArregloCita] = useState([]);
  const [tipoCita, setTipoCita] = useState("");
  const [verificador, setVerificador] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalServicioUso, setModalServicioUso] = useState(false);
  const [modalCitas, setModalCitas] = useState(false);
  const [ModalCitaEditEstilista, setModalCitaEditEstilista] = useState(false);
  const [ModalCitaEditEstilistaVenta, setModalCitaEditEstilistaVenta] = useState(false);
  const [isModalActualizarOpen, setIsModalActualizarOpen] = useState(false);
  const [event, setEvent] = useState();
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [datosParametros, setDatosParametros] = useState({
    idUser: 0,
    fecha: new Date(),
    idRec: 0,
    idSuc: 0,
    idCliente: 0,
    nombreCliente: "",
    nombreEstilista: "",
  });
  const [datosParametrosCitaTemp, setDatosParametrosCitaTemp] = useState({});
  const [datosParametrosFechaCitaTemp, setDatosParametrosFechaCitaTemp] = useState({});
  const handleChangeObservaciones = (e) => {
    const debouncedOnChange = debounce(() => {
      setFormCitasObservaciones2(e.target.value);
    }, 300); // 300 milisegundos de retraso

    debouncedOnChange();
  };

  function validarContraseña() {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: "Ingrese su contraseña",
        input: "password",
        inputAttributes: {
          autocapitalize: "off",
        },
        inputAutoFocus: true, // Establece el enfoque automáticamente
        customClass: {
          popup: "swal2-popup", // Agrega una clase personalizada al cuadro de diálogo
          container: "swal2-container", // Agrega una clase personalizada al contenedor
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
  const [formCitasObservaciones2, setFormCitasObservaciones2] = useState("");
  const [formServicio, setFormServicio] = useState({
    id_Cita: 0,
    idServicio: 0,
    cantidad: 0,
    precio: 0,
    observaciones: "",
    usuario: 0,
    d_servicio: "",
    id: 0,
    tiempo: 0,
  });

  useEffect(() => {
    if (datosParametrosCitaTemp.no_cliente) {
      putEditarCita();
    }
  }, [datosParametrosCitaTemp]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const getCitas = async (fecha) => {
    try {
      const response = await peinadosApi.get(
        `/DetalleAgendaSelv20?fecha=${format(
          fecha ? fecha : datosParametros.fecha,
          "yyyyMMdd"
        )}&suc=${idSuc}&nomberEstilista=${"%"}&nombreCliente=${"%"}`
      );
      setArregloCita(
        response.data.map((item) => {
          let hora1 = new Date(item.hora1);
          let hora2 = new Date(item.hora2);
          hora1.setFullYear(new Date(item.fecha).getFullYear(), new Date(item.fecha).getMonth(), new Date(item.fecha).getDate());
          hora2.setFullYear(new Date(item.fecha).getFullYear(), new Date(item.fecha).getMonth(), new Date(item.fecha).getDate());
          return {
            ...item,
            start: hora1.toISOString(),
            end: hora2.toISOString(),
            resourceId: item.no_estilista,
            title: "",
            type: 2,
            bgColor:
              item.estadoCita == 6
                ? "#bababa"
                : item.estadoCita == 1
                ? "#F8C471" // Sandy Orange
                : item.esDomicilio == true
                ? "#DDA0DD" // Plum
                : item.estadoCita == 2
                ? "#AFEEEE" // Pale Turquoise
                : item.estadoCita == 3
                ? "#FFF26C" // Lemon Chiffon
                : item.estadoCita == 4
                ? "#90EE90" // Light Green
                : item.estadoCita == 5
                ? "#DDA0DD" // Plum
                : "#bababa", // Light Gray
          };
        })
      );

      return response.data.map((item) => {
        let hora1 = new Date(item.hora1);
        let hora2 = new Date(item.hora2);
        let fechaBase = new Date(item.fecha);
        hora1.setFullYear(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
        hora2.setFullYear(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate());
        return {
          ...item,
          start: hora1.toISOString(),
          end: hora2.toISOString(),
          resourceId: item.no_estilista,
          title: "",
          type: 2,
          // bgColor: "red",
          bgColor:
            item.estadoCita == 6
              ? "#bababa"
              : item.estadoCita == 1
              ? "#F8C471" // Sandy Orange
              : item.esDomicilio == true
              ? "#DDA0DD" // Plum
              : item.estadoCita == 2
              ? "#AFEEEE" // Pale Turquoise
              : item.estadoCita == 3
              ? "#FFF26C" // Lemon Chiffon
              : item.estadoCita == 4
              ? "#90EE90" // Light Green
              : "#bababa", // Light Gray
        };
      });
    } catch (err) {
      console.error(err);
    }
  };
  const zonaHoraria = "America/Mexico_City"; // Ajusta según tu ubicación

  const fetchData = async (probando) => {
    console.log(probando ? probando : 2)
    
    const fechaLocal = utcToZonedTime(probando ? probando : new Date(), zonaHoraria); // Reemplaza con la fecha deseada, zonaHoraria);

    const responseEstilistas = await peinadosApi
      // .get(`/Estilistas5?id=0&sucursal=${idSuc}&fecha=${probando ? probando.toISOString().split("T")[0] : datosParametros.fecha ? datosParametros.fecha.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}`)
      .get(`/Estilistas5?id=0&sucursal=${idSuc}&fecha=${probando ? format(fechaLocal, "yyyy-MM-dd"):format(fechaLocal, "yyyy-MM-dd")}`)
      .then((response) => {
        setArreglo(
          response.data.map((item) => {
            const newItem = {
              ...item,
              name: item.estilista,
              id: item.clave,
            };
            delete newItem.toggleExpandStatus;
            return newItem;
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
    const responseCitas = await getCitas(probando);
    return responseCitas;
  };

  const getCitasDia = (elimina) => {
    peinadosApi
      .get(
        `/ClientesCitasDia10?suc=${idSuc}&cliente=0&fecha=${format(datosParametros.fecha, "yyyyMMdd")}&tipoCita=${
          tipoCita ? tipoCita : "%"
        }&nombreEstilista=${elimina ? "" : datosParametros.nombreEstilista}&nombreCliente=${elimina ? "" : datosParametros.nombreCliente}`
      )
      .then((response) => {
        setArregloCitaDia(response.data);
      });
  };
  useEffect(() => {
    fetchData();
    getCitasDia();
  }, []);
  useEffect(() => {
    // getEstilistas();
    getCitasDia();
  }, [tipoCita, datosParametros.fecha]);

  const [state, dispatch] = useReducer(reducer, initialState);
  const [inicializarAgenda, setinicializarAgenda] = useState(false);
  useEffect(() => {
    schedulerData = new SchedulerData(datosParametros.fecha, ViewType.Day, false, false, {
      besidesWidth: window.innerWidth <= 1600 ? 100 : 350,
      dayMaxEvents: 99,
      weekMaxEvents: 9669,
      monthMaxEvents: 9669,
      quarterMaxEvents: 6599,
      yearMaxEvents: 9956,
      customMaxEvents: 9965,
      eventItemPopoverTrigger: "click",
      schedulerContentHeight: "100%",
    });
    schedulerData.setSchedulerLocale(dayjsLocale);
    schedulerData.setCalendarPopoverLocale(antdLocale);
    schedulerData.setResources(arreglo);
    schedulerData.setEvents(arregloCita);
    setTimeout(() => {
        if (arreglo.length > 0 && arregloCita.length > 0) {
        if (inicializarAgenda == false) {
          setinicializarAgenda(true);
          dispatch({ type: "INITIALIZE", payload: schedulerData });
          console.log("INICIALIZADO")
        }
        console.log("ACTUALIZADO")
        console.log(schedulerData)
      dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });
      }
        // 
        // return () => dispatch({ type: "REINITIALIZE" });
      }, 1500);
  }, [arregloCita, arreglo]);

  const actualizarAgenda = (response, schedulerData) => {
    schedulerData.setEvents(response);
    // setTimeout(() => {
    //   console.log(schedulerData);
    //   console.log(schedulerData.getDateLabel());
    //   // dispatch({ type: "INITIALIZE", payload: schedulerData });
    //   // return () => dispatch({ type: "REINITIALIZE" });
    // }, 1500);
  };

  const actualizarFechayCitas = (schedulerData, dias, fecha) => {
    setDatosParametros((datosParametrosPrevios) => {
      const tempFecha = new Date(fecha ? fecha : datosParametrosPrevios.fecha);
      tempFecha.setDate(tempFecha.getDate() + dias);
      if (dias == 0) tempFecha.setDate(tempFecha.getDate() + 1);
      fetchData(tempFecha).then((response) => {
        // getCitas(tempFecha).then((response) => {
          if (dias < 0) {
            schedulerData.prev();
          } else if (dias === 0) {
            // schedulerData.setDate(format(tempFecha, "yyyy-MM-dd"));
            schedulerData.setDate((tempFecha ).toISOString().split("T")[0]);
          } else {
            schedulerData.next();
          }
          actualizarAgenda(response, schedulerData);
        // });
      });
      return {
        ...datosParametrosPrevios,
        fecha: new Date(tempFecha.setHours(0, 0, 0, 0)), // Aquí se ajusta la hora a 00:00
      };
    });
  };

  const prevClick = (schedulerData) => {
    actualizarFechayCitas(schedulerData, -1);
  };

  const nextClick = (schedulerData) => {
    actualizarFechayCitas(schedulerData, +1);
  };

  const onSelectDate = (schedulerData, date) => {
    console.log({ date });
    actualizarFechayCitas(schedulerData, 0, date);
  };

  const onViewChange = (schedulerData, view) => {
    const start = new Date();

    schedulerData.setViewType(view.viewType, view.showAgenda, view.isEventPerspective);
    schedulerData.setEvents(arregloCita);
    dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });

    const secondsBetween = (date1, date2) => {
      const diff = Math.abs(date1.getTime() - date2.getTime());
      return diff / 1000;
    };
    console.log("Elapsed seconds: " + secondsBetween(start, new Date()));
  };

  const ops1 = (schedulerData, event) => {
    handleOpenNewWindowEdit({
      idCita: event.idCita,
      idUser: event.no_estilista,
      idRec: idRec,
      idCliente: event.no_cliente,
      fecha: event.hora1,
      flag: 0,
      estadoCita: event.estadoCita2,
      tiempo: event.tiempo,
      idServicio: event.idServicios,
      nombreCliente: event.nombre,
      idSuc: idSuc,
    });
    return;
    setDatosParametros({
      fecha: fecha.setDate(fecha.getDate() + 1),
    });
    dispatch({ type: "REINITIALIZE", payload: schedulerData });

    jezaApi
      .get(`/Estilistas?suc=21&fecha=${format(datosParametros.fecha + 1, "yyyy-MM-dd")}`)
      .then((response) => {
        setArreglo(
          response.data.map((item) => {
            const newItem = {
              ...item,
              name: item.nombre,
            };
            delete newItem.toggleExpandStatus;
            return newItem;
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
    jezaApi
      .get(`/Cita?cliente=%&f1=${format(datosParametros.fecha, "yyyyMMdd")}&suc=21`)
      .then((response) => {
        setArregloCita(
          response.data.map((item) => {
            const newItem = {
              ...item,
              start: item.fechaCita,
              end: item.horaFin,
              resourceId: item.idEstilista,
              title: item.ServicioDescripción,
              type: 3,
              bgColor: "red",
            };
            delete newItem.toggleExpandStatus;
            return newItem;
          })
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const ops2 = (schedulerData, event) => {
    openModal();
    setEvent(event);
    console.log(event);
    return;
    editCita2(event);
  };

  const updateEventStart = (schedulerData, event, newStart) => {
    if (confirm(`Do you want to adjust the start of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newStart: ${newStart}}`)) {
    }
    dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });
  };

  const updateEventEnd = (schedulerData, event, newEnd) => {
    if (confirm(`Do you want to adjust the end of the event? {eventId: ${event.id}, eventTitle: ${event.title}, newEnd: ${newEnd}}`)) {
      schedulerData.updateEventEnd(event, newEnd);
    }
    dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });
  };

  const moveEvent = async (schedulerData, event, slotId, slotName, start, end) => {
    if (event.estadoCita == 4) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Cita en proceso, imposible cambiar de estilista desde agenda`,
      });
      return;
    }
    // return;
    if (new Date(start) < new Date()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `La fecha de la hora no puede ser anterior al dia de hoy`,
      });
      return;
    }
    const isVerified = await verificarDisponibilidad(event.tiempo, new Date(start), slotId, event.idCita);
    if (!isVerified) return;

    if (event.estadoCita == 2 && slotId != event.no_estilista) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Cita requerida, imposible cambiar de estilista`,
      });
      return;
    }

    const nombreAgendaNuevo = dataTrabajadores.find((item) => item.id === slotId).nombre_agenda;
    const nombreAgendaAnterior = dataTrabajadores.find((item) => item.id === event.no_estilista).nombre_agenda;

    Swal.fire({
      title: "Cambio de Cita",
      html: `
        <p>CLIENTE: Publico en General</p>
        <p>ANTERIOR:<br>Horas: ${format(new Date(event.hora1), "hh:mm a")}   Estilista: ${nombreAgendaAnterior ? nombreAgendaAnterior : ""}</p>
        <p>NUEVA:<br>Horas: ${format(new Date(start), "hh:mm a")}   Estilista: ${nombreAgendaNuevo ? nombreAgendaNuevo : ""}</p>
        <p>Quiere confirmar el cambio?</p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const contraseñaValidada = await validarContraseña();
        if (contraseñaValidada) {
          setDatosParametrosFechaCitaTemp({
            fecha: start,
            usuarioEstilista: slotId,
          });
          setDatosParametrosCitaTemp(event);
        }
      }
    });
  };

  const newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
    console.log(schedulerData);
    // return
    //     handleOpenNewWindow({
    //       idCita: 0,
    //       idUser: slotId,
    //       idCliente: 0,
    //       fecha: start,
    //       flag: 0,
    //     });
    // if (
    //   confirm(
    //     `Do you want to create a new event? {slotId: ${slotId}, slotName: ${slotName}, start: ${start}, end: ${end}, type: ${type}, item: ${item}}`
    //   )
    // ) {
    //   let newFreshId = 0;
    //   schedulerData.events.forEach((item) => {
    //     if (item.id >= newFreshId) newFreshId = item.id + 1;
    //   });

    //   let newEvent = {
    //     id: newFreshId,
    //     title: "New event you just created",
    //     start: start,
    //     end: end,
    //     resourceId: slotId,
    //     bgColor: "purple",
    //   };
    //   schedulerData.addEvent(newEvent);
    //   dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });
    // }
  };

  const onScrollLeft = (schedulerData, schedulerContent) => {
    if (schedulerData.ViewTypes === ViewType.Day) {
      schedulerData.prev();
      schedulerData.setEvents(DemoData.events);
      dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });
      schedulerContent.scrollLeft = 10;
    }
  };
  const onScrollRight = (schedulerData, schedulerContent, maxScrollLeft) => {
    if (schedulerData.ViewTypes === ViewType.Day) {
      schedulerData.next();
      schedulerData.setEvents(DemoData.events);
      dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });
      schedulerContent.scrollLeft = maxScrollLeft - 10;
    }
  };

  const onScrollTop = () => console.log("onScrollTop");

  const onScrollBottom = () => console.log("onScrollBottom");

  const toggleExpandFunc = (schedulerData, slotId) => {
    schedulerData.toggleExpandStatus(slotId);
    dispatch({ type: "UPDATE_SCHEDULER", payload: schedulerData });
  };

  const columns2 = [
    {
      field: "accion",
      headerName: "Accion",
      width: 85,
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div style={{ fontSize: "16px" }}>
          <FaMoneyBillAlt
            size={23}
            disabled
            onClick={() => {
              if (params.row.idVenta > 1) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: `Cita ya está en venta, no se puede pasar a venta`,
                });
                return;
              }
              setEvent({
                fecha: params.row.fecha,
                no_cliente: params.row.no_cliente2,
                estadoCita: params.row.estatusCita,
                hora1: params.row.hora_cita,
                tiempo: params.row.tiempo,
                idCita: params.row.id,
                no_estilista: params.row.idEstilista,
                verificacion: true,
                hora1Verifica: params.row.hora_cita,
              });
              setFormCitaServicio({
                ...formCitaServicio,
                idCita: params.row.id,
              });
              setFormCita({
                ...formCita,
                no_cliente: params.row.no_cliente2,
                fecha: params.row.hora_cita,
                no_estilista: params.row.idEstilista,
                estatusCita: 100,
              });
              setModalServicioUso(true);
            }}
          >
            AS
          </FaMoneyBillAlt>
          <AiFillEdit
            size={23}
            onClick={() => {
              setEvent({
                fecha: params.row.fecha,
                no_cliente: params.row.no_cliente2,
                estadoCita: params.row.estatusCita,
                hora1: params.row.hora_cita,
                tiempo: params.row.tiempo,
                idCita: params.row.id,
                no_estilista: params.row.idEstilista,
                idVenta: params.row.idVenta,
              });
              setFormCitaServicio({
                ...formCitaServicio,
                idCita: params.row.id,
              });
              setFormDetalleCitasServicios({
                fecha: params.row.dia_cita,
                fechaFinal: params.row.horafinal,
                idEstilista: params.row.idEstilista,
                d_clave_prod: params.row.descripcion,
                cantidad: params.row.cantidad,
                idServicio: params.row.idServicio,
                precio: params.row.importe,
                id: params.row.no_cliente,
                tiempo: params.row.tiempo,
                idCita: params.row.id,
                estatusCita: params.row.estatusCita,
              });
              if (params.row.idVenta > 1) {
                setModalCitas(false);
                setModalEdicionVenta(true);
                return;
              }
              setModalEdicionServicios2(true);
            }}
          ></AiFillEdit>
          <FaTrash
            disabled
            size={23}
            onClick={() => {
              if (params.row.id == 1) {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: `Cita ya está en venta, para eliminar debe de ser en ventas`,
                });
                return;
              }

              putDetalleCitasServiciosUpd4(0, params.row.sucursal, params.row.id, 0, params.row.idEstilista, 0, 0, idUser, 0, 0, new Date());
            }}
          >
            Cancelar
          </FaTrash>
        </div>
      ),
    },

    // Esta es la columna del ID único
    { field: "d_stilista", headerName: "Estilista", width: 85, align: "center", sortable: false, style: { fontSize: "16px" } }, // Esta es la columna del ID único
    {
      field: "stao_estilista",
      headerName: "M/Folio",
      width: 50,
      options: {
        setCellProps: () => ({ align: "center", justifyContent: "center" }),
      },
      renderCell: (params) => (
        <p style={{ lineHeight: "28px", height: "28px", margin: 0, fontSize: "16px" }}>
          {params.row.stao_estilista == 4 && params.row.estatusCita == 2
            ? "RD"
            : params.row.stao_estilista == 4 && params.row.estatusCita == 3
            ? "AD"
            : params.row.stao_estilista == 5 && params.row.estatusCita == 2
            ? "RD"
            : params.row.stao_estilista == 5 && params.row.estatusCita == 3
            ? "AD"
            : params.row.estatusCita == 2
            ? "R"
            : params.row.estatusCita == 3
            ? "A"
            : params.row.estatusCita == 4
            ? "S"
            : params.row.estatusCita == 5
            ? "D"
            : params.row.estatusCita == 1
            ? "N/A"
            : ""}
        </p>
      ),
    },
    { field: "d_cliente", headerName: "Cliente", width: 300, style: { fontSize: "16px" } },
    { field: "descripcion", headerName: "Servicio", width: 330, style: { fontSize: "16px" } },
    {
      field: "tiempo",
      headerName: "T",
      width: 40,
      renderCell: (params) => (
        <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0, fontSize: "16px" }}>{params.row.tiempo}</p>
      ),
    },

    {
      field: "hora_cita",
      headerName: "HI",
      width: 60,
      renderCell: (params) => (
        <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0, fontSize: "16px" }}>
          {format(new Date(params.row.hora_cita), "HH:mm")}
        </p>
      ),
    },
    {
      field: "horafinal",
      headerName: "HF",
      width: 60,
      renderCell: (params) => (
        <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0, fontSize: "16px" }}>
          {format(new Date(params.row.horafinal), "HH:mm")}
        </p>
      ),
    },
    {
      field: "importe",
      headerName: "Total",
      width: 60,
      renderCell: (params) => (
        <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0, fontSize: "16px" }}>
          {Number(params.row.importe).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
        </p>
      ),
    },
    { field: "id", headerName: "Clave", width: 70, align: "center", sortable: false, style: { fontSize: "16px" } }, // Esta es la columna del ID único

    {
      field: "observaciones",
      headerName: "Observaciones",
      width: 270,
      renderCell: (params) => <p className="centered-cell">{params.row.observaciones}</p>,
    },
  ];

  const columns = [
    {
      field: "accion",
      headerName: "Accion",
      width: 85,
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <FaMoneyBillAlt
            size={23}
            disabled
            onClick={() => {
              setEvent({
                fecha: params.row.fecha,
                no_cliente: params.row.no_cliente2,
                estadoCita: params.row.estatusCita,
                hora1: params.row.hora_cita,
                tiempo: params.row.tiempo,
                idCita: params.row.id,
                no_estilista: params.row.idEstilista,
                verificacion: true,
              });
              setFormCitaServicio({
                ...formCitaServicio,
                idCita: params.row.id,
              });
              setFormCita({
                ...formCita,
                no_cliente: params.row.no_cliente2,
                fecha: params.row.hora_cita,
                no_estilista: params.row.idEstilista,
                estatusCita: 100,
              });
              setModalServicioUso(true);
            }}
          >
            AS
          </FaMoneyBillAlt>
          <AiFillEdit
            size={23}
            onClick={() => {
              setEvent({
                fecha: params.row.fecha,
                no_cliente: params.row.no_cliente2,
                estadoCita: params.row.estatusCita,
                hora1: params.row.hora_cita,
                tiempo: params.row.tiempo,
                idCita: params.row.id,
                no_estilista: params.row.idEstilista,
              });
              setFormCitaServicio({
                ...formCitaServicio,
                idCita: params.row.id,
              });
              setFormDetalleCitasServicios({
                fecha: params.row.dia_cita,
                idEstilista: params.row.idEstilista,
                d_clave_prod: params.row.descripcion,
                cantidad: params.row.cantidad,
                idServicio: params.row.idServicio,
                precio: params.row.importe,
                id: params.row.no_cliente,
                tiempo: params.row.tiempo,
                idCita: params.row.id,
                estatusCita: params.row.estatusCita,
              });
              setModalEdicionServicios2(true);
            }}
          ></AiFillEdit>
          <FaTrash
            disabled
            size={23}
            onClick={() =>
              putDetalleCitasServiciosUpd4(0, params.row.sucursal, params.row.id, 0, params.row.idEstilista, 0, 0, idUser, 0, 0, new Date())
            }
          >
            Cancelar
          </FaTrash>
        </div>
      ),
    },

    // Esta es la columna del ID único
    { field: "d_stilista", headerName: "Estilista", width: 70, align: "center", sortable: false }, // Esta es la columna del ID único
    {
      field: "stao_estilista",
      headerName: "M/Folio",
      width: 50,
      options: {
        setCellProps: () => ({ align: "center", justifyContent: "center" }),
      },
      renderCell: (params) => (
        <p style={{ lineHeight: "28px", height: "28px", margin: 0 }}>
          {params.row.estatusCita == 4
            ? params.row.stao_estilista
            : params.row.estatusCita == 2
            ? "R"
            : params.row.estatusCita == 3
            ? "A"
            : params.row.estatusCita == 4
            ? "S"
            : params.row.estatusCita == 5
            ? "D"
            : params.row.estatusCita == 1
            ? "N/A"
            : ""}
        </p>
      ),
    },
    {
      field: "d_cliente",
      headerName: "Cliente",
      description: "This column has a value getter and is not sortable.",
      sortable: false,
      width: 300,
    },
    { field: "descripcion", headerName: "Servicio", width: 270 },
    {
      field: "tiempo",
      headerName: "T",
      width: 40,
      renderCell: (params) => <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0 }}>{params.row.tiempo}</p>,
    },

    {
      field: "hora_cita",
      headerName: "HI",
      width: 60,
      renderCell: (params) => (
        <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0 }}>{format(new Date(params.row.hora_cita), "HH:mm")}</p>
      ),
    },
    {
      field: "horafinal",
      headerName: "HF",
      width: 60,
      renderCell: (params) => (
        <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0 }}>{format(new Date(params.row.horafinal), "HH:mm")}</p>
      ),
    },
    {
      field: "importe",
      headerName: "Total",
      width: 60,
      renderCell: (params) => (
        <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0 }}>
          {Number(params.row.importe).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
        </p>
      ),
    },
    { field: "id", headerName: "Clave", width: 70, align: "center", sortable: false }, // Esta es la columna del ID único

    // {
    //   field: "cantidad",
    //   headerName: "Cantidad",
    //   width: 130,
    //   renderCell: (params) => <p style={{ textAlign: "center", lineHeight: "28px", height: "28px", margin: 0 }}>{params.row.cantidad}</p>,
    // },
  ];

  // const ligaPruebas = "http://localhost:5173/";
  const ligaPruebas = "http://cbinfo.no-ip.info:9019/";
  const handleOpenNewWindow = ({ idCita, idUser, idCliente, fecha, flag }) => {
    const url = `${ligaPruebas}miliga/crearcita?idCita=${idCita}&idUser=${idUser}&idCliente=${idCliente}&fecha=${fecha}&idSuc=${1}&idRec=${1}&flag=${flag}`; // Reemplaza esto con la URL que desees abrir
    const width = 390;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1`;
    window.open(url, "_blank", features);
  };
  const handleOpenNewWindowEdit = ({ idCita, idUser, idCliente, fecha, flag, estadoCita, tiempo, nombreCliente, idSuc }) => {
    const url = `${ligaPruebas}miliga/editarcita?idCita=${idCita}&idUser=${idUser}&idCliente=${idCliente}&fecha=${fecha}&idRec=${idRec}&flag=${flag}&estadoCita=${estadoCita}&tiempo=${tiempo}&nombreCliente=${nombreCliente}&idSuc=${idSuc}`; // Reemplaza esto con la URL que desees abrir
    const width = 600;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1`;
    window.open(url, "_blank", features);
  };
  const handleOpenAgenda2 = ({ idRec, suc, idSuc }) => {
    const url = `${ligaPruebas}miliga/Agenda2?idRec=${idRec}&suc=${suc}&idSuc=${idSuc}`; // Reemplaza esto con la URL que desees abrir
    const width = 1200;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1`;
    window.open(url, "_blank", features);
  };
  const handleOpenNewWindowNewSchedule = () => {
    const url = `${ligaPruebas}miliga/crearcita?fecha=${datosParametros.fecha}`; // Reemplaza esto con la URL que desees abrir
    const width = 450;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1`;
    window.open(url, "_blank", features);
  };
  const handleOpenNewWindowListaEspera = () => {
    const url = `${ligaPruebas}miliga/listaEspera?idUser=${idRec}&fecha=${fecha}&idSuc=${idSuc}`; // Reemplaza esto con la URL que desees abrir
    const width = 1500;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1`;
    window.open(url, "_blank", features);
  };
  const [formCitaServioActualizacion, setFormCitaServioActualizacion] = useState();
  const updateServicios = () => {
    // Hazme el peinadosApi PUT sp_detalleCitasServiciosUpdv3?idServicio={idServicio}&cantidad={cantidad}&tiempo={tiempo}&precio={precio}&usuarioCambio={usuarioCambio}&idEstilista={idEstilista}&fechaCita={fechaCita}&estatusCita={estatusCita}&id={id}

    peinadosApi
      .put("/sp_detalleCitasServiciosUpdv3", null, {
        params: {
          idServicio: 0,
          cantidad: 0,
          tiempo: 0,
          precio: 0,
          usuarioCambio: idUser,
          idEstilista: 0,
          fechaCita: 0,
          estatusCita: 0,
          id: 0, // idCitaServicio
        },
      })
      .then((response) => {});
  };
  const felicitarCliente = async (id, sucursal) => {
    await peinadosApi.put("/sp_clientesFelicitarUpd", null, {
      params: {
        id: id,
        suc: sucursal,
      },
    });
  };
  const putEditarCita = async () => {
    let fechaActual = new Date();
    // Extrae el año, mes y día
    let año = fechaActual.getFullYear();
    let mes = fechaActual.getMonth(); // Nota: getMonth() devuelve un valor de 0 a 11, donde 0 es enero y 11 es diciembre
    let día = fechaActual.getDate();
    let fechaSinHora = new Date(año, mes, día);
    peinadosApi
      .put("/DetalleCitas", null, {
        params: {
          id: datosParametrosCitaTemp.idCita,
          cia: datosParametrosCitaTemp.cia,
          sucursal: datosParametrosCitaTemp.sucursal,
          clave_cita: "000",
          no_cita: 1,
          no_estilista: datosParametrosFechaCitaTemp.usuarioEstilista,
          no_cliente: datosParametrosCitaTemp.no_cliente,
          dia_cita: format(new Date(datosParametrosFechaCitaTemp.fecha), "yyyy-MM-dd'T'HH:mm:ss"),
          hora_cita: format(new Date(datosParametrosFechaCitaTemp.fecha), "yyyy-MM-dd'T'HH:mm:ss"),
          fecha: fechaSinHora,
          tiempo: datosParametrosCitaTemp.tiempo,
          user: idUser,
          tipo_servicio: "1",
          serv: "1",
          importe: 100,
          cancelada: false,
          stao_estilista: datosParametrosCitaTemp.estadoCita2,
          nota_canc: 0,
          registrada: true,
          observacion: 0,
          user_uc: 0,
          estatus: datosParametrosCitaTemp.estadoCita2,
        },
      })
      .then((response) => {
        Swal.fire("Saved!", "", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      });
  };

  const statusBoxStyle = {
    display: "flex",
    gap: "10px",
  };
  {
    /* item.estadoCita == 1
              ? "#F8C471" // Sandy Orange
              : item.estadoCita == 2
              ? "#AFEEEE" // Pale Turquoise
              : item.estadoCita == 3
              ? "#FFFACD" // Lemon Chiffon
              : item.estadoCita == 4
              ? "#90EE90" // Light Green
              : item.estadoCita == 5
              ? "#DDA0DD" // Plum
              : "#bababa", // Light Gray */
  }
  const boxStyles = {
    noDisponible: {
      backgroundColor: "#F8C471",
      padding: "5px",
      color: "black",
    },
    requerido: {
      backgroundColor: "#AFEEEE",
      padding: "5px",
      color: "black",
    },
    asignado: {
      backgroundColor: "#FFF26C",
      padding: "5px",
      color: "black",
    },
    enServicio: {
      backgroundColor: "#90EE90",
      padding: "5px",
      color: "black",
    },
    domicilio: {
      backgroundColor: "#DDA0DD",
      padding: "5px",
      color: "black",
    },
    conflicto: {
      backgroundColor: "#bababa",
      padding: "5px",
      color: "black",
    },
  };
  const editCita2 = async (eventItem) => {
    try {
      // Extraer fecha y crear una nueva fecha sin la hora
      let fechaActual = new Date(eventItem.hora1);
      let año = fechaActual.getFullYear();
      let mes = fechaActual.getMonth(); // Nota: getMonth() devuelve un valor de 0 a 11, donde 0 es enero y 11 es diciembre
      let día = fechaActual.getDate();
      let fechaSinHora = new Date(año, mes, día);

      // Validar contraseña
      const contraseñaValidada = await validarContraseña();
      if (contraseñaValidada) {
        // Realizar la solicitud PUT
        const response = await peinadosApi.put("/DetalleCitasReducido", null, {
          params: {
            id: eventItem.idCita,
            no_estilista: eventItem.no_estilista,
            no_cliente: eventItem.no_cliente,
            dia_cita: eventItem.hora1,
            hora_cita: eventItem.hora1,
            fecha: fechaSinHora,
            user: idUser,
            cancelada: true,
            stao_estilista: 1,
            nota_canc: 0,
            registrada: false,
            observacion: 1,
            user_uc: 0,
            estatus: 0,
          },
        });

        // Mostrar mensaje de éxito
        console.log(response);
        Swal.fire({
          title: "Cita cancelada",
          icon: "success",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: "Contraseña incorrecta",
          icon: "error",
          confirmButtonText: "Ok",
        });
      }
    } catch (error) {
      // Manejo de errores
      console.error("Error al cancelar la cita:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al cancelar la cita. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "95%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    height: "95%",
    overflow: "auto", // Añade esta línea
  };
  const styleCrearCita = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "100%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    p: 4,
    height: "100%",
    overflow: "auto", // Añade esta línea
  };
  const styleCantidad = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    height: "30%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto", // Añade esta línea
  };
  const styleObservaciones = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    height: "50%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto", // Habilita el scroll
    maxHeight: "100%", // Limita la altura máxima para el contenido
  };
  const styleAltaServicio = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "75%",
    height: "85%",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    overflow: "auto", // Habilita el scroll
    maxHeight: "100%", // Limita la altura máxima para el contenido
  };

  const [formCita, setFormCita] = useState({
    cia: 1,
    sucursal: idSuc,
    no_estilista: 0,
    no_cliente: 0,
    dia_cita: new Date(),
    hora_cita: new Date(),
    fecha: null,
    tiempo: 0,
    user: 1,
    importe: 0,
    cancelada: false,
    stao_estilista: 0,
    nota_canc: "nota cancelacion",
    observacion: null,
    user_uc: 1,
    estatus: 0,
    estatusAsignado: false,
    estatusRequerido: false,
    esServicioDomicilio: false,
    registrada: false,
    cumpleaños: null,
    estatusCita: 0,
  });
  const [formCitaDescripciones, setFormCitaDescripciones] = useState({
    descripcion_no_estilista: "",
    descripcion_no_cliente: "",
    descripcion_no_cancelacio: "",
  });
  const [formVentaOperaciones, setFormVentaOperaciones] = useState({
    no_venta: 0,
    sucursal: idSuc,
    idCliente: 0,
  });
  const [formVentaHistoriales, setFormVentaHistoriales] = useState({
    userId: null,
    claveProd: null,
    sucursal: idSuc,
    fechaInicio: null,
    fechaFin: null,
    idCliente: null,
    botonConsultar: false,
    claveProdDescripcion: "",
  });

  const [formVentaTemporal, setFormVentaTemporal] = useState({
    tiempo: 0,
    precioTotal: 0,
    otros: 0,
    precioTotalyOtros: 0,
  });
  const [formCitaServicio, setFormCitaServicio] = useState({
    idCita: null,
    clave_prod: "",
    descripcion: "",
    precio: 0,
    tiempo: 0,
    cantidad: 1,
  });
  const [formPuntosObservaciones, setFormPuntosObservaciones] = useState({
    idMovto: 0,
    sucursal: idSuc,
    fecha_movto: null,
  });
  const [movableReactPrueba, setMovableReactPrueba] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [clientesModal, setClientesModal] = useState(false);
  const [ModalClientesPuntos, setModalClientesPuntos] = useState(false);
  const [ModalOperacionesPuntos, setModalOperacionesPuntos] = useState(false);
  const [ModalCantidad, setModalCantidad] = useState(false);
  const [ModalCrear, setModalCrear] = useState(false);
  const [ProductosModalEdicion, setProductosModalEdicion] = useState(false);
  const [ProductosModalEdicionServicios, setProductosModalEdicionServicios] = useState(false);
  const [modalEdicionServicios, setModalEdicionServicios] = useState(false);
  const [modalEdicionServicios2, setModalEdicionServicios2] = useState(false);
  const [modalEdicionVenta, setModalEdicionVenta] = useState(false);
  const [productosModal, setProductosModal] = useState(false);
  const [productosModalLectura, setProductosModalLectura] = useState(false);
  const [productosModalGrupos, setproductosModalGrupos] = useState(false);
  const [modalCitasObservaciones, setModalCitasObservaciones] = useState(false);
  const [verificarContraModal, setVerificarContraModal] = useState(false);

  const [puntosModal, setPuntosModal] = useState(false);
  const [ModalVentasHistorial, setModalVentasHistorial] = useState(false);
  const [ModalVentasOperaciones, setModalVentasOperaciones] = useState(false);
  const [ventaTemporal, setVentaTemporal] = useState([]);
  const [dataClientes, setDataClientes] = useState([]);
  const [dataClientesPuntos, setDataClientesPuntos] = useState({});

  const [dataProductos, setDataProductos] = useState([]);
  const [dataOperaciones, setDataOperaciones] = useState([]);
  const [dataPuntosporCliente, setDataPuntosPorCliente] = useState({});
  const [dataEstilistaDisponibilidadHorario, setdataEstilistaDisponibilidadHorario] = useState({});
  const [dataEstilistas, setDataEstilistas] = useState([]);
  const [contraseña, setContraseña] = useState("");
  const contraseñaEstática = "1234";
  const [valido, setValido] = useState(false);
  const [totalOperacionesPuntos, settotalOperacionesPuntos] = useState(0);
  useEffect(() => {
    const total = dataOperaciones.reduce((a, b) => a + b.precio, 0);
    if (total <= 0) return;
    settotalOperacionesPuntos(total);
  }, [dataOperaciones]);

  const handleChange = (event) => {
    setContraseña(event.target.value);
  };
  const handleCheckboxChange = (name) => {
    setFormCita({
      ...formCita,
      estatusRequerido: name === "estatusRequerido",
      estatusAsignado: name === "estatusAsignado",
    });
  };
  const handleCheckboxChangeDomicilio = (event) => {
    const { name, checked } = event.target;
    setFormCita({
      ...formCita,
      [name]: checked,
    });
  };

  function validarContraseña() {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: "Ingrese su contraseña",
        input: "password",
        inputAttributes: {
          autocapitalize: "off",
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

  const minDateTime = setHours(startOfToday(), 8);

  const maxDateTime = setHours(startOfToday(), 20);
  useEffect(() => {
    setFormCita({ ...formCita, fecha: new Date(), user: idUser, sucursal: idSuc });
  }, [idUser, idRec, idSuc]);

  useEffect(() => {
    // getEstilistas();
    getProductos();
    getEstilistasDisponibilidadHorario();
    getClientes();
  }, []);

  useEffect(() => {
    if (formCita.no_cliente == 0) return;
    getClientesePuntos();
    getOperaciones();
    getPuntos();
    fetchDetalleCitasObservaciones().then((response) => {
      if (response.data.length > 0) setModalCitasObservaciones(true);
    });
    const otrosClientes = dataClientes.find((item) => item.id == formCita.no_cliente);
    if (otrosClientes) {
      // console.log({ otrosClientes?.saldoCta });
      setFormVentaTemporal({ ...formVentaTemporal, otros: otrosClientes?.saldoCta });
    }
  }, [formCita.no_cliente]);
  useEffect(() => {

    getOperaciones();
  }, [formPuntosObservaciones]);

  const getEstilistas =  async() => {
    await peinadosApi.get(`/estilistas5?id=0&sucursal=${idSuc}&fecha=${datosParametros.fecha ? datosParametros.fecha.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}`).then((response) => {
      setDataEstilistas(response.data);
    }); 
  };
  const getClientes = () => {
    peinadosApi.get(`/clientesZonas?id=0&idSuc=${idSuc ? idSuc : 0}`).then((response) => {
      setDataClientes(response.data);
    });
  };

  const getClientesePuntos = () => {
    peinadosApi.get(`/sp_detallePuntosSel2?id=1&noCliente=${formCita.no_cliente}`).then((response) => {
      setDataClientesPuntos(response.data);
      console.log("<");
    });
  };

  const getProductos = () => {
    peinadosApi
      .get("/sp_cPSEAC?id=0&cia=1&sucursal=2&almacen=1&marca=%&descripcion=%&verinventariable=0&esServicio=2&esInsumo=0&obsoleto=0")
      .then((response) => {
        setDataProductos(response.data);
      });
  };
  const getOperaciones = () => {
    peinadosApi
      .get(
        `/sp_detalleOperaciones7?noCliente=${formCita.no_cliente}&sucursal=${formPuntosObservaciones.sucursal}&noMovto=${formPuntosObservaciones.idMovto}`
      )
      .then((response) => {
        setDataOperaciones(response.data);
      });
  };
  const getPuntos = () => {
    peinadosApi.get(`/DetallePuntosCliente?noCliente=${formCita.no_cliente}`).then((response) => {
      setDataPuntosPorCliente(response.data);
    });
  };

  const getEstilistasDisponibilidadHorario = () => {
    peinadosApi.get(`/CatEstilistasDisponiblidad?sucursal=${idSuc}`).then((response) => {
      setdataEstilistaDisponibilidadHorario(response.data);
    });
  };

  const { dataCitasServicios, fetchDetalleCitasServicios, setdataCitasServicios } = useDetalleCitasServicios({
    noCliente: formCita.no_cliente,
    sucursal: idSuc,
    fecha: formCita.fecha ? format(new Date(formCita.fecha), "yyyy/MM/dd") : new Date(),
    idCita: formCitaServicio.idCita,
  });
  const { dataCuentasPendientes } = useDetalleCuentaPendietes({ no_cliente: formCita.no_cliente });
  const { dataObservaciones, fetchObservaciones } = useObservaciones({ idCliente: formCita.no_cliente });
  const { dataCitasObservaciones, fetchDetalleCitasObservaciones } = useDetalleCitasObservaciones({ idCliente: formCita.no_cliente });
  const { dataClientesSaldosPendientes } = useDetalleSaldosPendientes({ no_cliente: formCita.no_cliente });
  const { dataTrabajadores } = useNominaTrabajadores();
  const { DataVentasOperaciones } = useVentasOperaciones({
    noVenta: formVentaOperaciones.no_venta,
    sucursal: idSuc,
    idCliente: formCita.no_cliente,
  });
  const { dataClasificacion } = usesp_ClasificacionSel({ idCliente: formCita.no_cliente });
  const { dataSucursales } = useSucursales();
  const { dataVentasHistoriales, fetchVentasHistoriales } = useVentasHistoriales({
    claveProd: formVentaHistoriales.claveProd,
    fechaFin: formVentaHistoriales.fechaFin,
    fechaInicio: formVentaHistoriales.fechaInicio,
    idCliente: formCita.no_cliente,
    sucursal: idSuc,
    userID: formVentaHistoriales.userId,
  });
  const { dataCitaEmpalme, fetchCitaEmpalme } = useCitaEmpalme({
    fechacita: formCita.fecha,
    no_estilista: formCita.no_estilista,
    tiempoCita: formVentaTemporal.tiempo,
  });
  const { dataCumpleañosProximos, fetchCumpleañosProximos } = useCumpleañosProximos();
  const { dataCitaEmpalme5, fetchCitaEmpalme5 } = useCitaEmpalme5({
    fechacita: formCita.fecha,
    no_estilista: formCita.no_estilista,
    tiempoCita: formVentaTemporal.tiempo,
    idCita: 0,
  });
  const { dataHorarioDisponibleEstilistas, fetchHorarioDisponibleEstilistas } = useHorarioDisponibleEstilistas6({
    fecha: formCita.fecha,
    cveEmpleado: formCita.no_estilista,
    tiempo: formVentaTemporal.tiempo,
  });
  const [formCitasObservaciones, setFormCitasObservaciones] = useState({
    id: 0,
    observaciones: null,
  });

  const [formPromocion, setFormPromocion] = useState({
    id: 0,
  });
  const [modalCumpleanios, setModalCumpleanios] = useState(false);
  const [modalPromociones, setModalPromociones] = useState(false);
  const [modalPrepagos, setModalPrepagos] = useState(false);
  const [modalPromocionesFechas, setModalPromocionesFechas] = useState(false);
  const [modalPromocionesGrupos, setModalPromocionesGrupos] = useState(false);

  const { dataPromocionesZonas } = usePromocionesZonas();
  const { dataPromocionesGrupos } = usePromocionesGrupos({ idPromocion: formPromocion.id });
  const { dataVentasOperacionesMediosPagos2 } = useVentasOperacionesMediosPagos2({ sucursal: idSuc, folioVenta: formVentaOperaciones.no_venta });

  const { dataPrepagos, fetchPrepagos } = usePrepagos();
  const { fetchProductosAreaDeptoSub, dataProductosAreaDeptoSub, setDataProductosAreaDeptoSub } = useProductosAreaDeptoSub();
  const putCitasObservaciones = (estado, idCita) => {
    setModalCitasObservaciones(false);
    if (estado == 1) {
      Swal.fire({
        title: "Observaciones",
        showConfirmButton: true,
        confirmButtonText: "Ingrese la observacion para cambiarlo",
        input: "text",
        preConfirm: (observaciones) => {
          peinadosApi
            .put(
              `/sp_DetalleCitasObservacionesput?id=${idCita}&observaciones=${observaciones}
          `
            )
            .then((response) => {
              Swal.fire({
                title: "Editaro",
                icon: "success",
                text: "Observacion Editado",
              });
            });
        },
      }).then((result) => {
        // if (result.isConfirmed) {
        // }
      });
    } else {
      peinadosApi.put(`/sp_DetalleCitasObservacionesput?id=${idCita}&observaciones`).then((response) => {
        Swal.fire({
          title: "Eliminado",
          text: "Observacion escondida",
        });
      });
    }
  };
  const comparaFecha = (fecha3, rango) => {
    var fecha1 = new Date();
    var fecha2 = new Date();
    fecha2.setDate(fecha1.getDate() + rango);
    if (fecha3) fecha3.setFullYear(fecha1.getFullYear());
    if (rango == 0) fecha1.setHours(0, 0, 0, 0);
    return fecha3 >= fecha1 && fecha3 <= fecha2;
  };

  useEffect(() => {
    if (dataCuentasPendientes.length > 0) {
      // setFormVentaTemporal({ ...formVentaTemporal, otros: dataCuentasPendientes[0].mensaje });
    }
    if (isNaN(formCita.cumpleaños) == false) {
      if (comparaFecha(formCita.cumpleaños, 15)) {
        Swal.fire({
          title: "Cumpleanio cerca",
          text: `Cumpleanios dentro de un intervalo de 15 dias`,
          confirmButtonText: "Entendido",
        });
      }
      if (comparaFecha(formCita.cumpleaños, 0))
        Swal.fire({
          title: "Cumpleanio es hoy",
          text: `Cumpleanios dentro de un intervalo de 0 dias, felicidades`,
          confirmButtonText: "Entendido",
        });
    }
  }, [dataCuentasPendientes]);

  useEffect(() => {
    if (dataClientesSaldosPendientes.length > 0 && dataClientesSaldosPendientes[0].saldo > 0) {
      alert(`Cuenta pendiente por ${dataClientesSaldosPendientes[0].saldo}`);
      // Swal.fire({
      //   title: "Cuenta pendiente",
      //   text: `Cuenta pendiente por ${dataClientesSaldosPendientes[0].saldo}`,
      //   confirmButtonText: "Entendido",
      // });
    }
  }, [dataClientesSaldosPendientes]);

  useEffect(() => {
    console.log("EJECUTANDOSE");
    const calculateTotals = () => {
      const totalPrice = dataCitasServicios.reduce((acc, service) => {
        return acc + Number(service.precio) * Number(service.cantidad);
      }, 0);

      const totalTime = dataCitasServicios.reduce((acc, service) => {
        return acc + Number(service.tiempo) * Number(service.cantidad);
      }, 0);

      return { totalPrice, totalTime };
    };

    const { totalPrice, totalTime } = calculateTotals();

    setFormVentaTemporal((prevState) => ({
      ...prevState,
      precioTotal: totalPrice,
      tiempo: totalTime,
      precioTotalyOtros: totalPrice + formVentaTemporal.otros,
    }));
  }, [dataCitasServicios]);

  const columnsCitasServicios = [
    {
      field: "Accion",
      headerName: "Accion",
      width: 55,
      renderCell: (cell) => (
        <>
          <AiFillDelete
            size={33}
            onClick={() => {
              setDataVentaTemporal({ ...dataVentaTemporal, id: cell.row.id });

              putDetalleCitasServiciosUpd4(
                cell.row.id,
                idSuc, //sucursal: 2 sucursal: 1
                formCitaServicio.idCita,
                cell.row.tiempo,
                cell.row.idEstilista,
                1,
                cell.row.id_servicio,
                idUser,
                0,
                cell.row.precio
              );
            }}
          >
            Eliminar
          </AiFillDelete>
          <AiFillEdit
            size={33}
            onClick={() => {
              console.log(cell.row);
              setModalEdicionServicios(true);

              setFormDetalleCitasServicios({
                ...formDetalleCitasServicios,
                cantidad: cell.row.cantidad,
                id: cell.row.id,
                idEstilista: cell.row.idEstilista,
                idServicio: cell.row.id_servicio,
                d_clave_prod: cell.row.descripcion,
                tiempo: cell.row.tiempo,
                precio: cell.row.precio,
                fecha: cell.row.fecha,
              });
            }}
          >
            Editar
          </AiFillEdit>
        </>
      ),
    },
    {
      field: "observaciones",
      headerName: "Descripción",
      width: 350,
      renderCell: (cell) => {
        return <p className="centered-cell">{cell.row.descripcion}</p>;
      },
    },
    {
      field: "precio",
      headerName: "Precio",
      width: 70,
      renderCell: (cell) => <p className="centered-cell">{cell.row.precio.toFixed(2)}</p>,
      cellClassName: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      field: "tiempo",
      headerName: "Tiempo",
      width: 70,
      renderCell: (cell) => <p className="centered-cell">{cell.row.tiempo + ""}</p>,
      cellClassName: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    { field: "cantidad", headerName: "Cantidad", width: 70 },
    {
      field: "fecha",
      headerName: "Hora",
      width: 130,
      renderCell: (cell) => <p className="centered-cell">{format(new Date(cell.row.fecha), "hh:mm a")}</p>,
    },
  ];
  const columnsCitasServiciosAltaServicio = [
    {
      field: "Accion",
      headerName: "Accion",
      width: 70,
      renderCell: (cell) => (
        <>
          <AiFillDelete
            size={35}
            onClick={() => {
              setDataVentaTemporal({ ...dataVentaTemporal, id: cell.row.id });

              putDetalleCitasServiciosUpd4(
                cell.row.id,
                idSuc, //sucursal: 2 sucursal: 1
                formCitaServicio.idCita,
                cell.row.tiempo,
                cell.row.idEstilista,
                1,
                cell.row.id_servicio,
                idUser,
                0,
                cell.row.precio
              );
            }}
          >
            Eliminar
          </AiFillDelete>
          <AiFillEdit
            size={35}
            onClick={() => {
              setModalEdicionServicios(true);
              setFormDetalleCitasServicios({
                ...formDetalleCitasServicios,
                cantidad: cell.row.cantidad,
                id: cell.row.id,
                idEstilista: cell.row.idEstilista,
                idServicio: cell.row.id_servicio,
                d_clave_prod: cell.row.descripcion,
                tiempo: cell.row.tiempo,
                precio: cell.row.precio,
                fecha: cell.row.fecha,
              });
            }}
          >
            Editar
          </AiFillEdit>
        </>
      ),
    },
    {
      field: "observaciones",
      headerName: "Descripción",
      width: 400,
      renderCell: (cell) => {
        // Divide el texto en dos partes por el espacio
        const [parte1, parte2] = cell.row.descripcion.split(" ");

        return <p className="centered-cell">{cell.row.descripcion}</p>;
      },
    },
    {
      field: "precio",
      headerName: "Precio",
      width: 70,
      renderCell: (cell) => <p className="centered-cell">{cell.row.precio.toFixed(2)}</p>,
      cellClassName: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      field: "tiempo",
      headerName: "Tiempo",
      width: 70,
      renderCell: (cell) => <p className="centered-cell">{cell.row.tiempo + " Min"}</p>,
      cellClassName: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    { field: "cantidad", headerName: "Cantidad", width: 70 },
    // {
    //   field: "fecha",
    //   headerName: "Hora",
    //   width: 130,
    //   renderCell: (cell) => <p className="centered-cell">{format(new Date(cell.row.fecha), "hh:mm a")}</p>,
    // },
  ];
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
  const handleOpen = () => {
    postCrearCita();
  };
  const handleClose = () => null;
  function renderButtonClient(params) {
    return (
      <div>
        <Button
          variant={"contained"}
          onClick={() => {
            setFormCita({ ...formCita, id_cliente: params.row.id, no_cliente: params.row.id });
            setFormCitaDescripciones({ ...formCita, descripcion_no_cliente: params.row.nombre });
            setClientesModal(false);
          }}
        >
          Agregar
        </Button>
      </div>
    );
  }

  const postCitaServicios = async () => {
    Swal.fire({
      title: "Confirmación de cita",
      text: "¿Desea confirmar esta cita?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        validarContraseña().then(async (contraseñaValidada) => {
          if (!contraseñaValidada) return;
          else {
            ventaTemporal.forEach(async (elemento) => {
              await peinadosApi
                .post("DetalleCitasServicios", null, {
                  params: {
                    id_cita: formCitaServicio.idCita,
                    id_servicio: elemento.clave,
                    cantidad: elemento.cantidad,
                    tiempo: elemento.tiempo,
                    precio: elemento.precio,
                    observaciones: "0",
                    usuarioAlta: idUser,
                    usuarioCambio: 0,
                    sucursal: idSuc,
                    fecha: new Date(),
                    idCliente: formCita.no_cliente,
                    fechaCita: new Date(formCita.fecha),
                    idEstilista: formCita.no_estilista,
                  },
                })
                .then((response) => {
                  Swal.fire({
                    icon: "success",
                    text: "Registro Realizado con éxito, deasea añadir otro servicio con otro estilista?",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Si",
                    cancelButtonText: "No",
                    showCancelButton: true,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setVentaTemporal([]);
                      window.location.reload();
                    } else {
                      window.close();
                    }
                  });
                })
                .catch((error) => {
                  Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: `Favor de contactase cons sistemas ${error}`,
                    confirmButtonColor: "#3085d6", // Cambiar el color del botón OK
                  });
                });
            });
          }
        });
      }
    });
  };
  const verificaDisponibilidadSucursal = () => {
    let entradaSucursal = dataEstilistaDisponibilidadHorario[0].hora_entrada;
    let salidaSucursal = dataEstilistaDisponibilidadHorario[0].hora_salida;

    let horaEntrada = new Date(entradaSucursal).getHours();
    let minutoEntrada = new Date(entradaSucursal).getMinutes();
    let horaSalida = new Date(salidaSucursal).getHours();
    let minutoSalida = new Date(salidaSucursal).getMinutes();

    // Obtener la hora y minutos de la cita a verificar
    let horaCita = new Date(formCita.fecha).getHours();
    let minutoCita = new Date(formCita.fecha).getMinutes();

    // Convertir todo a minutos desde medianoche para facilitar la comparación
    let minutosDesdeMedianocheEntrada = horaEntrada * 60 + minutoEntrada;
    let minutosDesdeMedianocheSalida = horaSalida * 60 + minutoSalida;
    let minutosDesdeMedianocheCita = horaCita * 60 + minutoCita;

    console.log(minutosDesdeMedianocheEntrada);
    console.log(minutosDesdeMedianocheSalida);
    console.log(minutosDesdeMedianocheCita);

    let esValida = minutosDesdeMedianocheCita >= minutosDesdeMedianocheEntrada && minutosDesdeMedianocheCita <= minutosDesdeMedianocheSalida;
    return esValida;
  };
  const postCrearCita = async () => {
    if (formCitaServicio.idCita) {
      setProductosModal(true);
      return;
    }

    let fechaActual = new Date(formCita.fecha);
    // Extrae el año, mes y día
    let año = fechaActual.getFullYear();
    let mes = fechaActual.getMonth(); // Nota: getMonth() devuelve un valor de 0 a 11, donde 0 es enero y 11 es diciembre
    let día = fechaActual.getDate();
    let fechaSinHora = new Date(año, mes, día);
    const esValida = verificaDisponibilidadSucursal();
    if (new Date(formCita.fecha) < new Date()) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Imposible agregar una cita en el pasado ${formCita.fecha}`,
        confirmButtonColor: "#3085d6", // Cambiar el color del botón OK
      });
      return;
    }
    console.log(formCita);
    if (
      formCita.no_estilista == 0 ||
      !formCita.no_estilista ||
      formCita.no_cliente == 0 ||
      (formCita.estatusAsignado == false && formCita.estatusRequerido == false)
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Faltan por ingresar datos favor de verificar ${
          formCita.estatusAsignado + "" + formCita.estatusRequerido + "" + formCita.esServicioDomicilio
        } `,
        confirmButtonColor: "#3085d6", // Cambiar el color del botón OK
      });
    } else {
      if (esValida === false) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "La hora de la cita está fuera del horario de esta sucursal, ¿desea asignar la cita?",
          confirmButtonColor: "#3085d6", // Cambiar el color del botón OK
          showCancelButton: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            // Si el usuario confirma, mostrar el modal de verificación de contraseña
            validarContraseña().then(async (contraseñaValidada) => {
              if (contraseñaValidada) {
                try {
                  const response = await peinadosApi.post("/DetalleCitas", null, {
                    params: {
                      cia: 1,
                      sucursal: idSuc,
                      no_estilista: formCita.no_estilista,
                      no_cliente: formCita.no_cliente,
                      dia_cita: new Date(formCita.fecha),
                      hora_cita: new Date(formCita.fecha),
                      fecha: fechaSinHora,
                      tiempo: 0,
                      user: idUser,
                      importe: 0,
                      cancelada: false,
                      stao_estilista: 1,
                      nota_canc: 0,
                      registrada: true,
                      observacion: formCitasObservaciones2,
                      user_uc: 0,
                      estatus: formCita.estatusAsignado ? 3 : formCita.estatusRequerido ? 2 : 1,
                      servDomicilio: formCita.esServicioDomicilio == false ? 0 : 1,
                    },
                  });
                  setProductosModal(true);
                  setFormCitaServicio({ ...formCitaServicio, idCita: response.data.mensaje2 });
                  return response.data.mensaje2;
                } catch (error) {
                  alert(`Hubo un error, ${error}`);
                }
              } else {
                // La contraseña no es válida, puedes mostrar un mensaje o realizar alguna otra acción
              }
            });

            // validarContraseña();
          } else {
            // Si el usuario cancela, no hacer nada adicional
            return;
          }
        });
      } else {
        try {
          const response = await peinadosApi.post("/DetalleCitas", null, {
            params: {
              cia: 1,
              sucursal: idSuc,
              no_estilista: formCita.no_estilista,
              no_cliente: formCita.no_cliente,
              dia_cita: formCita.fecha,
              hora_cita: formCita.fecha,
              fecha: fechaSinHora,
              tiempo: 0,
              user: idUser,
              importe: 0,
              cancelada: false,
              stao_estilista: 1,
              nota_canc: 0,
              registrada: true,
              observacion: formCitasObservaciones2,
              user_uc: 0,
              estatus: formCita.estatusAsignado ? 3 : formCita.estatusRequerido ? 2 : 1,
              servDomicilio: formCita.esServicioDomicilio == false ? 0 : 1,
            },
          });
          setProductosModal(true);
          setFormCitaServicio({ ...formCitaServicio, idCita: response.data.mensaje2 });
          if (formCita.esServicioDomicilio) postCitasServicios(11948, 0, 1, response.data.mensaje2);
          return response.data.mensaje2;
        } catch (error) {
          alert(`Hubo un error, ${error}`);
        }
      }
    }
  };

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
  function formatFecha2(fecha) {
    const date = new Date(fecha);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Los meses en JavaScript empiezan en 0

    return `${day}-${month}`;
  }

  const cumpleaños = ["2024-04-11", "1999-09-07", "2024-04-18", "2024-01-01T00:00:00.000Z", "2024-12-12T06:00:00.000Z"];
  const cumpleañosFormateados = cumpleaños.map((fecha) => formatFecha(fecha));

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
              setFormCita({
                ...formCita,
                id_cliente: cell.row.original.id,
                no_cliente: cell.row.original.id,
                cumpleaños: new Date(cell.row.original.cumpleaños),
                cve_cliente: cell.row.original.no_cliente,
              });
              setFormCitaDescripciones({ ...formCita, descripcion_no_cliente: cell.row.original.nombre });
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
    // {
    //   accessorKey: "ap_paterno",
    //   header: "Apellido Paterno",
    //   size: 100,
    // },
    // {
    //   accessorKey: "ap_materno",
    //   header: "Apellido Materno",
    //   size: 100,
    // },

    {
      accessorKey: "telefono",
      header: "Telefono",
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
              if (ventaTemporal.find((x) => x.clave === cell.row.original.id)) {
                setProductosModal(false);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: `El producto ya fue agregado`,
                  confirmButtonColor: "#3085d6",
                  confirmButtonText: "Entendido",
                });
                return;
              }
              if (formVentaHistoriales.botonConsultar) {
                setFormVentaHistoriales({ claveProd: cell.row.original.id, claveProdDescripcion: cell.row.original.descripcion });
              } else {
                setDataVentaTemporal({
                  clave: cell.row.original.id,
                  clave_prod: cell.row.original.clave_prod,
                  descripcion: cell.row.original.descripcion,
                  precio: cell.row.original.precio_lista,
                  tiempo: cell.row.original.tiempox,
                });
                postCitasServicios(cell.row.original.id, cell.row.original.tiempox, cell.row.original.precio);
                setProductosModal(false);
              }
            }}
          >
            Agregar
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "clave_prod",
      header: "Cve",
      size: 50,
    },
    {
      accessorKey: "descripcion",
      header: "Descripcion",
      size: 555,
    },
    {
      accessorKey: "tiempox",
      header: "T",
      size: 50,
      Cell: ({ cell }) => <p className="centered-cell">{cell.row.original.tiempox + ""}</p>,
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      accessorKey: "precio_lista",
      header: "Precio",
      size: 50,
      Cell: ({ cell }) => <p className="centered-cell">{Number(cell.row.original.precio)}</p>,
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
  const columnsProductosMRTLectura = useMemo(() => [
    {
      accessorKey: "clave_prod",
      header: "Cve",
      size: 50, //small column
      maxSize: 60,
      grow: false, //allow this column to grow to fill in remaining space - new in v2.8
    },
    {
      accessorKey: "descripcion",
      header: "Descripcion",
      minSize: 100, //min size enforced during resizing
      maxSize: 800, //max size enforced during resizing
      size: 666, //medium column
      grow: true, //allow this column to grow to fill in remaining space - new in v2.8
    },
    {
      accessorKey: "tiempox",
      header: "T",
      size: 50, //small column
      maxSize: 60,

      grow: false, //allow this column to grow to fill in remaining space - new in v2.8

      Cell: ({ cell }) => <p className="centered-cell">{cell.row.original.tiempox + ""}</p>,
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      accessorKey: "precio_lista",
      header: "$",
      size: 50, //small column
      maxSize: 60,

      grow: false, //allow this column to grow to fill in remaining space - new in v2.8

      Cell: ({ cell }) => <p className="centered-cell">{Number(cell.row.original.precio)}</p>,
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
  ]);
  const columnsProductosMRTEdicion = useMemo(() => [
    {
      accessorKey: "acciones",
      header: "Acción",
      size: 55,
      Cell: ({ cell }) => (
        <div>
          <Button
            variant={"contained"}
            onClick={() => {
              if (ventaTemporal.find((x) => x.clave === cell.row.original.id)) {
                setProductosModal(false);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: `El producto ya fue agregado`,
                  confirmButtonColor: "#3085d6",
                  confirmButtonText: "Entendido",
                });
                return;
              }
              if (formVentaHistoriales.botonConsultar) {
                setFormVentaHistoriales({ claveProd: cell.row.original.id, claveProdDescripcion: cell.row.original.descripcion });
              } else {
                setFormDetalleCitasServicios({
                  ...formDetalleCitasServicios,
                  idServicio: cell.row.original.id,
                  d_clave_prod: cell.row.original.descripcion,
                  tiempo: cell.row.original.tiempox,
                  precio: cell.row.original.precio,
                  // fecha: cell.row.fecha,
                });
                setProductosModalEdicion(false);
              }
            }}
          >
            Agregar
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "clave_prod",
      header: "Cve",
      size: 55,
    },
    {
      accessorKey: "descripcion",
      header: "Descripcion",
      size: 500,
    },
    {
      accessorKey: "tiempox",
      header: "T",
      size: 50,
      Cell: ({ cell }) => <p className="centered-cell">{cell.row.original.tiempox + ""}</p>,
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      accessorKey: "precio",
      header: "Precio",
      size: 55,
      Cell: ({ cell }) => <p className="centered-cell">{Number(cell.row.original.precio)}</p>,
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      accessorKey: "precioPromocion",
      header: "Precio",
      size: 50,
      Cell: ({ cell }) => (
        <p className="centered-cell">{Number(cell.row.original.precioPromocion).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</p>
      ),
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
  ]);
  const columnsProductosMRTEdicionServicios = useMemo(() => [
    {
      accessorKey: "acciones",
      header: "Acción",
      size: 100,
      Cell: ({ cell }) => (
        <div>
          <Button
            variant={"contained"}
            onClick={() => {
              setFormCitaServioActualizacion({
                ...formCitaServioActualizacion,
                idServicio: cell.row.original.id,
                descripcion: cell.row.original.descripcion,
                tiempo: cell.row.original.tiempox,
                precio: cell.row.original.precio,
              });
              setProductosModalEdicionServicios(false);
            }}
          >
            Agregar
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "clave_prod",
      header: "Clave_prod",
      size: 100,
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
      accessorKey: "precio",
      header: "Precio",
      size: 100,
      Cell: ({ cell }) => (
        <p className="centered-cell">{Number(cell.row.original.precio).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</p>
      ),
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
    {
      accessorKey: "precioPromocion",
      header: "Precio",
      size: 100,
      Cell: ({ cell }) => (
        <p className="centered-cell">{Number(cell.row.original.precioPromocion).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}</p>
      ),
      className: "centered-cell", // Agrega esta línea para aplicar la clase CSS
    },
  ]);

  const columnsProductos = [
    { field: "x", headerName: "Seleccion", renderCell: renderButtonProduct, width: 130 },
    { field: "clave_prod", headerName: "Clave prod", width: 130 },
    { field: "descripcion", headerName: "Descripción", width: 250 },
    { field: "precio_lista", headerName: "Precio", width: 130, renderCell: (params) => <p>{params.row.precio_lista.toFixed(2)}</p> },
    { field: "tiempox", headerName: "Tiempo", width: 130, renderCell: (params) => <p>{params.row.tiempox + " Min"}</p> },
  ];
  const columnsDataVentasHistoriales = [
    { field: "x", headerName: "Seleccion", renderCell: renderButtonVentaHistorial, width: 130 },
    { field: "sucursal", headerName: "Suc", width: 60 },
    {
      field: "fecha",
      headerName: "Fecha",
      width: 100,
      renderCell: (params) => <p className="centered-cell">{format(new Date(params.row.fecha), "dd/MM/yyyy")}</p>,
    },
    { field: "no_venta", headerName: "No_venta", width: 100, headerAlign: "center", cellClassName: "cell-center" },
    { field: "no_venta2", headerName: "No_venta2", width: 100, cellClassName: "cell-center" },
  ];
  const columnsDataVentasOperaciones = [
    // { field: "x", headerName: "Seleccion", renderCell: renderButtonProduct, width: 130 },
    { field: "nombreEstilista", headerName: "Estilista", width: 110 },
    // { field: "nombreUsuario", headerName: "Atendió", width: 110 },
    { field: "descripcion", headerName: "Producto", width: 333 },
    { field: "cant_producto", headerName: "C.", width: 30 },
    { field: "precio", headerName: "Total", width: 130 },
  ];
  const columnsDataVentasOperacionesMedios = [
    // { field: "x", headerName: "Seleccion", renderCell: renderButtonProduct, width: 130 },
    { field: "descripcion", headerName: "Medio Pago", width: 150 },
    { field: "PAGO", headerName: "Total", width: 130 },
  ];

  const columnsPuntos = [
    {
      field: "x",
      headerName: "Seleccion",
      renderCell: (params) => (
        <MdOutlineFolder
          size={20}
          onClick={() => {
            setFormPuntosObservaciones({
              idMovto: params.row.folio_movto,
              sucursal: params.row.sucursal,
              fecha: params.row.fecha_movto,
            });
            setModalOperacionesPuntos(true);
          }}
        />
      ),
    },
    { field: "sucursal", headerName: "Sucursal", width: 90 },
    {
      field: "fecha_movto",
      headerName: "Fecha",
      width: 130,
      renderCell: (params) => <p className="centered-cell">{format(new Date(params.row.fecha_movto), "dd/MM/yyyy")}</p>,
    },
    { field: "id", headerName: "folio", width: 90 },
    { field: "puntos", headerName: "Puntos", width: 90 },
    { field: "observaciones", headerName: "Observaciones", width: 270 },
  ];
  const columnsObservaciones = [
    {
      field: "1",
      headerName: "Actualizar",
      width: 80,
      renderCell: (params) => (
        <div>
          <AiFillDelete onClick={() => deleteObservaciones(params.row.id)} size={20} />
          <AiFillEdit
            size={20}
            onClick={() =>
              putObservaciones(
                params.row.id,
                params.row.id_cliente,
                params.row.fecha,
                params.row.observaciones,
                params.row.usr_registro,
                params.row.act_sucursal,
                params.row.visualizar,
                params.row.sucursal
              )
            }
          />
        </div>
      ),
    },
    {
      field: "fecha",
      headerName: "Fecha",
      width: 90,
      renderCell: (params) => <p className="centered-cell">{format(new Date(params.row.fecha), "dd/MM/yyyy")}</p>,
    },
    { field: "observaciones", headerName: "Observaciones", width: 270 },
  ];
  const columnsConultaPuntos = [
    { field: "estilista", headerName: "Estilista", width: 250 },

    { field: "descripcion", headerName: "Producto", width: 250 },
    { field: "cant_producto", headerName: "Cantidad", width: 90 },
    { field: "precio", headerName: "Precio", width: 90 },
    {
      field: "importe",
      headerName: "Importe",
      width: 90,
      renderCell: (params) => (
        <p className="centered-cell">
          {Number(params.row.precio * params.row.cant_producto).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
        </p>
      ),
    },
  ];

  const [dataVentaTemporal, setDataVentaTemporal] = useState({});
  function renderButtonProduct(params) {
    return (
      <div>
        <Button
          variant={"contained"}
          onClick={() => {
            const newId = ventaTemporal.length > 0 ? ventaTemporal[ventaTemporal.length - 1].id + 1 : 0;
            setDataVentaTemporal({
              clave: params.row.id,
              descripcion: params.row.descripcion,
              precio: params.row.precio_lista,
              tiempo: params.row.tiempox,
            });
            // setModalCantidad(true);
            postCitasServicios(params.row.id, params.row.tiempox, params.row.precio);

            setProductosModal(false);
          }}
        >
          Agregar
        </Button>
      </div>
    );
  }
  function renderButtonVentaHistorial(params) {
    return (
      <div>
        <Button
          variant={"contained"}
          onClick={() => {
            setFormVentaOperaciones({
              ...formVentaOperaciones,
              no_venta: params.row.no_venta,
              sucursal: params.row.sucursal,
              fecha: params.row.fecha,
            });
            setModalVentasOperaciones(true);
          }}
        >
          Seleccion
        </Button>
      </div>
    );
  }
  const [formDetalleCitasServicios, setFormDetalleCitasServicios] = useState({
    cantidad: null,
    id: null,
    idEstilista: null,
    idServicio: null,
    d_clave_prod: null,
    tiempo: null,
    fecha: null,
  });
  const putDetalleCitasServiciosUpd4 = async (
    id,
    sucursal,
    idCita,
    tiempo,
    idEstilista,
    mostrar,
    idServicio,
    usuario,
    cantidad,
    precio,
    fechaCita
  ) => {
    const contraseñaValidada = await validarContraseña();
    if (!contraseñaValidada) return;

    peinadosApi
      .put(`/sp_DetalleCitasServiciosUpd6`, null, {
        params: {
          id: id,
          sucursal: sucursal,
          idCita: idCita,
          tiempo: tiempo,
          idEstilista: idEstilista,
          mostrar: mostrar,
          idServicio: idServicio,
          usuario: usuario,
          cantidad: cantidad,
          precio: precio,
          fechaCita: fechaCita ? fechaCita : formCita.fecha,
        },
      })
      .then((response) => {
        fetchDetalleCitasServicios();
        Swal.fire({
          icon: "success",
          text: "Registro Realizado ",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Recargar pagina",
          cancelButtonText: "No",
          showCancelButton: true,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        setModalEdicionServicios(false);
        getCitasDia();
      });
  };
  const putDetalleCitasServiciosUpd7 = async (
    id,
    sucursal,
    idCita,
    tiempo,
    idEstilista,
    mostrar,
    idServicio,
    usuario,
    cantidad,
    precio,
    fechaCita,
    estatusCita
  ) => {
    const contraseñaValidada = await validarContraseña();
    if (!contraseñaValidada) return;

    peinadosApi
      .put(`/sp_DetalleCitasServiciosUpd7`, null, {
        params: {
          id: id,
          sucursal: sucursal,
          idCita: idCita,
          tiempo: tiempo,
          idEstilista: idEstilista,
          mostrar: mostrar,
          idServicio: idServicio,
          usuario: usuario,
          cantidad: cantidad,
          precio: precio,
          fechaCita: fechaCita ? fechaCita : formCita.fecha,
          estatusCita: estatusCita,
        },
      })
      .then((response) => {
        fetchDetalleCitasServicios();
        Swal.fire({
          icon: "success",
          text: "Registro Realizado ",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Recargar pagina",
          cancelButtonText: "No",
          showCancelButton: true,
        }).then((result) => {
          getCitasDia();
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        setModalEdicionServicios2(false);
      });
  };

  const putObservaciones = (id, id_cliente, fecha, observaciones, usr_registro, act_sucursal, visualizar, sucursal) => {
    peinadosApi
      .put(`/sp_catObsClintesUpd`, null, {
        params: {
          id: id,
          id_cliente: id_cliente,
          fecha: fecha,
          observaciones: observaciones,
          usr_registro: usr_registro,
          act_sucursal: act_sucursal,
          visualizar: visualizar,
          sucursal: id,
        },
      })
      .then(() => {
        Swal.fire({
          icon: "success",
          text: "Registro Realizado ",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Ok",
        });
        fetchObservaciones();
        setModalCitasObservaciones(false);
      });
  };
  const deleteObservaciones = (id) => {
    peinadosApi.delete(`/sp_catObsClintesDel?id=${id}`).then((response) => {
      Swal.fire({
        icon: "success",
        text: "Registro Realizado ",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
      });
      fetchObservaciones();
      setModalCitasObservaciones(false);
    });
  };
  const putCitasServiciosTerminadoFunction = async () => {
    await peinadosApi.put(`/sp_detalleCitasServiciosTerminado2`, null, {
      params: {
        idCita: formCitaServicio.idCita,
      },
    });
  };
  const putCitasServiciosTerminado = () => {
    setModalCrear(false);
    Swal.fire({
      title: "Confirmación de cita",
      text: "¿Desea confirmar esta cita?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        validarContraseña().then(async (contraseñaValidada) => {
          if (!contraseñaValidada) return;
          else {
            await peinadosApi
              .put(`/sp_detalleCitasServiciosTerminado2`, null, {
                params: {
                  idCita: formCitaServicio.idCita,
                },
              })
              .then((response) => {
                Swal.fire({
                  icon: "success",
                  text: "Registro Realizado con éxito, desea registrar otro servicio con otro estilista? ",
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "ok",
                  showConfirmButton: true,
                  cancelButtonText: "Cancelar",
                  showCancelButton: true,
                }).then((result) => {
                  if (result.isConfirmed) {
                    // setFormCitaServicio([]);
                    setFormCitaServicio({
                      ...formCitaServicio,
                      idCita: null,
                      estatusAsignado: false,
                      estatusRequerido: false,
                    });
                    setFormCita({
                      ...formCita,
                      cia: null,
                      sucursal: idSuc,
                      no_estilista: 0,
                    });

                    setFormCitaDescripciones({
                      ...formCitaDescripciones,
                      descripcion_no_cancelacion: "",
                      descripcion_no_estilista: "",
                    });
                    setdataCitasServicios([]);
                    // setFormDetalleCitasServicios({
                    //   cantidad: null,
                    //   id: null,
                    //   idEstilista: null,
                    //   idServicio: null,
                    //   d_clave_prod: null,
                    //   tiempo: null,
                    //   fecha: null,
                    // });
                    // setFormCita([]);
                    // setFormCitaDescripciones([]);
                    setTimeout(() => {
                      setModalCrear(true);
                    }, 1000);
                  } else {
                    window.close();
                    window.location.reload();
                  }
                });
              })
              .catch((error) => {
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: `Favor de contactase cons sistemas ${error}`,
                  confirmButtonColor: "#3085d6", // Cambiar el color del botón OK
                });
              });
          }
        });
      }
    });

    // await fetchCitaEmpalme().then(async (res) => {
    //   if (res && res.data[0].id > 0) {
    //     Swal.fire({
    //       icon: "error",
    //       title: "Error",
    //       text: `El estilista no tiene horario disponible, empalme`,
    //     });
    //     return;
    //   } else {
    //     await fetchHorarioDisponibleEstilistas().then((res) => {
    //       if (res) {
    //         console.log(res.data[0].clave_empleado);
    //         if (res.data[0].clave_empleado == "Cita sin restricciones") {
    //           console.log(0);
    //         } else {
    //           Swal.fire({
    //             icon: "error",
    //             title: "Error",
    //             text: `El estilista no tiene horario disponible`,
    //             confirmButtonColor: "#3085d6",
    //             confirmButtonText: "Quiere continuar?",
    //             showConfirmButton: true,
    //             showCancelButton: true,
    //           }).then((isConfirmed) => {
    //             if (!isConfirmed.isConfirmed) return;
    //             else {

    //             }
    //           });
    //         }
    //       }
    //     });
    //   }
    // });
  };
  // const postCitasServicios = (clave, tiempo, precio) => {
  //   verificarDisponibilidad().then(async () => {
  //     peinadosApi
  //       .post(`/sp_detalleCitasServiciosAdd6`, null, {
  //         params: {
  //           id_Cita: formCitaServicio.idCita,
  //           id_servicio: clave,
  //           cantidad: formCitaServicio.cantidad ? formCitaServicio.cantidad : 1,
  //           tiempo: tiempo,
  //           precio: precio,
  //           observaciones: formCita.observacion,
  //           usuarioAlta: formCita.no_estilista,
  //           usuarioCambio: formCita.no_estilista,
  //           sucursal: 2,
  //           fecha: new Date(),
  //           idCliente: formCita.no_cliente,
  //           idEstilista: formCita.no_estilista,
  //           fechaCita: formCita.fecha,
  //         },
  //       })
  //       .then((response) => {
  //         fetchDetalleCitasServicios();
  //       });

  //     // if (res && res.data[0].id > 0) {
  //     //   Swal.fire({
  //     //     icon: "error",
  //     //     title: "Error",
  //     //     text: `El estilista no tiene horario disponible, empalme`,
  //     //   });
  //     //   return;
  //     // }

  //     // if (resHorario) {
  //     //   console.log(resHorario);
  //     //   if (resHorario.data[0].clave_empleado == "Cita sin restricciones") {
  //     //     console.log(0);
  //     //   } else {
  //     //     Swal.fire({
  //     //       icon: "error",
  //     //       title: "Error",
  //     //       text: `El estilista no tiene horario disponible`,
  //     //       confirmButtonColor: "#3085d6",
  //     //       confirmButtonText: "Quiere continuar?",
  //     //       showConfirmButton: true,
  //     //       showCancelButton: true,
  //     //     }).then((isConfirmed) => {
  //     //       if (!isConfirmed.isConfirmed) return;
  //     //       else {
  //     //         // Aquí puedes agregar el código que se ejecutará si el usuario confirma
  //     //       }
  //     //     });
  //     //   }
  //     // }
  //   });
  // };
  const postCitasServicios = async (clave, tiempo, precio, idCita) => {
    await verificarDisponibilidad(tiempo, formCita.fecha, formCita.no_estilista, formCitaServicio.idCita).then((isVerified) => {
      console.log(isVerified);
      if (isVerified) {
        peinadosApi
          .post(`/sp_detalleCitasServiciosAdd7`, null, {
            params: {
              id_Cita: idCita ? idCita : formCitaServicio.idCita,
              id_servicio: clave,
              cantidad: formCitaServicio.cantidad ? formCitaServicio.cantidad : 1,
              tiempo: tiempo,
              precio: precio,
              observaciones: formCitasObservaciones2 ? formCitasObservaciones2 : "",
              usuarioAlta: idUser,
              usuarioCambio: formCita.no_estilista,
              sucursal: idSuc,
              fecha: new Date(),
              idCliente: formCita.no_cliente,
              idEstilista: formCita.no_estilista,
              fechaCita: formCita.fecha,
              esDomicilio: formCita.esServicioDomicilio == false ? 0 : 1,
              estatusCita: formCita.estatusAsignado ? 3 : formCita.estatusRequerido ? 2 : formCita.estatusCita == 100 ? 100 : 1,
            },
          })
          .then((response) => {
            setTimeout(() => {
              fetchDetalleCitasServicios();
              if (event?.verificacion == true) putCitasServiciosTerminadoFunction();
            }, 1000);
          });
      }
    });
  };
  const handleChangeFecha = (type, value) => {
    let newDateTime;
    if (type === "fecha") {
      onSelectDate(state.viewModel, format(value, "yyyy-MM-dd"));
      newDateTime = value ? new Date(value) : null;
      if (datosParametros.fecha) {
        const time = new Date(datosParametros.fecha).toTimeString().split(" ")[0];
        newDateTime = new Date(`${value.toDateString()} ${time}`);
      }
    } else {
      newDateTime = datosParametros.fecha ? new Date(datosParametros.fecha) : new Date();
      newDateTime.setHours(value.getHours());
      newDateTime.setMinutes(value.getMinutes());
      console.log(newDateTime);
    }
    setFormCita({ ...formCita, fecha: newDateTime });
  };
  const handleChangeFechaEvent = (type, value) => {
    let newDateTime;
    if (type === "fecha") {
      onSelectDate(state.viewModel, format(value, "yyyy-MM-dd"));
      newDateTime = value ? new Date(value) : null;
      if (event.fecha) {
        const time = new Date(event.fecha).toTimeString().split(" ")[0];
        newDateTime = new Date(`${value.toDateString()} ${time}`);
      }
    } else {
      newDateTime = event.fecha ? new Date(event.fecha) : new Date();
      newDateTime.setHours(value.getHours());
      newDateTime.setMinutes(value.getMinutes());
    }
    setEvent({ ...event, hora1: newDateTime });
  };
  const handleChangeFechaEdicionServicio = (type, value) => {
    let newDateTime;
    if (type === "fecha") {
      onSelectDate(state.viewModel, format(value, "yyyy-MM-dd"));
      newDateTime = value ? new Date(value) : null;
      if (formCitaServioActualizacion?.hora_cita) {
        const time = new Date(formCitaServioActualizacion?.hora_cita).toTimeString().split(" ")[0];
        newDateTime = new Date(`${value.toDateString()} ${time}`);
      }
    } else {
      newDateTime = formCitaServioActualizacion?.hora_cita ? new Date(formCitaServioActualizacion?.hora_cita) : new Date();
      newDateTime.setHours(value.getHours());
      newDateTime.setMinutes(value.getMinutes());
    }
    setFormCitaServioActualizacion({ ...formCitaServioActualizacion, hora_cita: newDateTime });
  };
  const handleChangeFechaServicio = (type, value) => {
    let newDateTime;
    if (type === "fecha") {
      onSelectDate(state.viewModel, format(value, "yyyy-MM-dd"));
      newDateTime = value ? new Date(value) : null;
      if (formDetalleCitasServicios.fecha) {
        const time = new Date(formDetalleCitasServicios.fecha).toTimeString().split(" ")[0];
        newDateTime = new Date(`${value.toDateString()} ${time}`);
      }
    } else {
      newDateTime = formDetalleCitasServicios.fecha ? new Date(formDetalleCitasServicios.fecha) : new Date();
      newDateTime.setHours(value.getHours());
      newDateTime.setMinutes(value.getMinutes());
    }
    const fechaInicio = new Date(newDateTime);
    const fechaFinal = new Date(fechaInicio.getTime() + parseInt(formDetalleCitasServicios.tiempo) * 60000);
    setFormDetalleCitasServicios({
      ...formDetalleCitasServicios,
      fecha: newDateTime,
      fechaFinal: fechaFinal ? fechaFinal : formDetalleCitasServicios.fechaFinal,
    });
  };
  const handleChangeFechaFinalServicio = (type, value) => {
    let newDateTime;
    if (type === "fechaFinal") {
      onSelectDate(state.viewModel, format(value, "yyyy-MM-dd"));
      newDateTime = value ? new Date(value) : null;
      if (formDetalleCitasServicios.fechaFinal) {
        const time = new Date(formDetalleCitasServicios.fechaFinal).toTimeString().split(" ")[0];
        newDateTime = new Date(`${value.toDateString()} ${time}`);
      }
    } else {
      newDateTime = formDetalleCitasServicios.fechaFinal ? new Date(formDetalleCitasServicios.fechaFinal) : new Date();
      newDateTime.setHours(value.getHours());
      newDateTime.setMinutes(value.getMinutes());
    }
    setFormDetalleCitasServicios({ ...formDetalleCitasServicios, fechaFinal: newDateTime });
  };

  const updateCita = async () => {
    const contraseñaValidada = await validarContraseña();
    if (!contraseñaValidada) return;
    let fechaActual = new Date(event?.fecha);
    let año = fechaActual.getFullYear();
    let mes = fechaActual.getMonth(); // Nota: getMonth() devuelve un valor de 0 a 11, donde 0 es enero y 11 es diciembre
    let día = fechaActual.getDate();
    let fechaSinHora = new Date(año, mes, día);
    peinadosApi
      .put("/DetalleCitasReducido", null, {
        params: {
          id: event?.idCita,
          no_estilista: event?.no_estilista,
          no_cliente: event?.no_cliente,
          dia_cita: event?.hora1,
          hora_cita: event?.hora1,
          fecha: fechaSinHora,
          user: idUser,
          cancelada: false,
          stao_estilista: 1,
          nota_canc: 0,
          registrada: false,
          observacion: "",
          user_uc: 0,
          estatus: 4,
        },
      })
      .then((response) => {
        console.log(response);
        Swal.fire({
          title: "Cita actualizada",
          icon: "success",
          confirmButtonText: "Ok",
        }).then((result) => {
          window.location.reload();
        });
      });
  };

  async function verificarDisponibilidad(tiempo, fecha, estilista, idCita) {
    const res = await fetchCitaEmpalme5(tiempo, new Date(fecha), estilista, idCita);
    const resHorario = await fetchHorarioDisponibleEstilistas(new Date(fecha), estilista, tiempo);

    if (res && res.data[0].id > 0) {
      const isConfirmed = await Swal.fire({
        icon: "error",
        title: "Error",
        text: "El estilista no tiene horario disponible, empalme. ¿Desea asignar la cita?",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Ok",
        showConfirmButton: true,
        showCancelButton: true,
      });
      if (!isConfirmed.isConfirmed) {
        //si no confirma
        return false;
      } else {
        const res = await validarContraseña();
        if (!res) return false;
      }
      // return false;
    }
    if (!resHorario) return false;
    if (resHorario.data[0].clave_empleado == "Cita sin restricciones" || resHorario.data[0].clave_empleado == "Prosiga") {
      console.log("");
    } else if (resHorario.data[0].clave_empleado == "Cita fuera del horario de salida del estilista") {
      const isConfirmed2 = await Swal.fire({
        icon: "error",
        title: "Error",
        text: `El estilista se encuentra fuera de horario, desea registrar la cita`,
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Si?",
        cancelButtonText: "CANCELAR",
        showConfirmButton: true,
        showCancelButton: true,
      });
      if (!isConfirmed2.isConfirmed) return false;
      const res = await validarContraseña();
      if (!res) return false;
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `El estilista no tiene horario disponible desde temprano, no se podria poner a las: ${format(fecha, "HH:mm")}`,
        confirmButtonColor: "#3085d6",
      });
      return false;
    }
    return true;
  }
  const [colummEdit, setColummEdit] = useState("");
  const handleCellDoubleClick = (params) => {
    if (
      params.field == "no_cliente" ||
      params.field == "stao_estilista" ||
      params.field == "id" ||
      params.field == "observaciones" ||
      params.field == "d_cliente"
    )
      return;
    if (params.row.idVenta > 0) {
      if (params.field == "descripcion") return;

      setModalCitaEditEstilistaVenta(true);
    } else {
      if (params.field == "horafinal") return;
      setModalCitaEditEstilista(true);
    }
    setFormCitaServioActualizacion(params.row);
    setColummEdit(params.field);
    // params contiene información sobre la celda,
    // como el ID de la fila y el campo de la celda.
    console.log(`Doble clic en la fila ${params.id}, columna ${params.field}`);
    // Aquí puedes poner la acción que quieras realizar.
    console.log({ params });
  };
  const columnsCumple = useMemo(
    () => [
      {
        header: "Nombre",
        accessorKey: "nombre",
        style: { fontSize: "1.2rem" },
        size: 300,
      },

      {
        header: "Telefono",
        accessorKey: "telefono",
        style: { fontSize: "1.2rem" },
      },
      {
        header: "Cumpleaños",
        accessorKey: "cumpleaños",
        Cell: ({ cell }) => {
          const fechaCompleta1 = cell.row.original.cumpleaños;
          const fechaFormateada1 = fechaCompleta1 ? formatFecha(fechaCompleta1) : "";

          return <span>{fechaFormateada1}</span>;
        },

        style: { fontSize: "1.2rem" },
      },
      {
        header: "Felicitado",
        accessorKey: "id",
        style: { fontSize: "1.2rem" },
        size: 50,

        Cell: ({ cell }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={cell.row.original.verificaCumpleaños}
                onClick={() => {
                  felicitarCliente(cell.row.original.id, 1);
                  fetchCumpleañosProximos(true);
                }}
              />
            }
            label={""}
            style={{ fontSize: "1.2rem" }}
          />
        ),
      },
    ],
    []
  );
  const columnsPromo = useMemo(
    () => [
      {
        accessorKey: "acciones",
        header: "Acción",
        size: 90,
        Cell: ({ cell }) => (
          <>
            <Button
              size="sm"
              onClick={() => {
                setFormPromocion({ id: cell.row.original.id });
                setModalPromocionesGrupos(true);
              }}
            >
              Seleccionar
            </Button>
          </>
        ),
      },
      {
        accessorKey: "descripcionPromo",
        header: "Promoción",
        size: 333,
      },
      {
        accessorKey: "f2",
        header: "Fecha fin",
        size: 40,
        Cell: ({ cell }) => {
          const fechaCompleta1 = cell.row.original.f2;
          const fechaFormateada1 = fechaCompleta1 ? formatFecha(fechaCompleta1) : "";

          return (
            <span
              style={{ textAlign: "center" }}
              onDoubleClick={() => {
                setFormPromocion({ id: cell.row.original.id });
                setModalPromocionesFechas(true);
              }}
            >
              {fechaFormateada1}
            </span>
          );
        },
      },
      // {
      //   accessorKey: "acciones",
      //   header: "Aplicar promo",
      //   size: 100,
      //   Cell: ({ cell }) => (
      //     <>
      //       <BsBuildingFillGear className="mr-2" onClick={() => toggleModalPromoSuc(cell.row.original)} size={23} />
      //       <BsDiagram3Fill onClick={() => eliminar(cell.row.original)} size={23} />

      //     </>
      //   ),
      // },
    ],
    [dataPromocionesZonas]
  );
  const columnsPrepagos = useMemo(
    () => [
      {
        accessorKey: "d_serv1",
        header: "Servicio 1",
        size: 100,
      },
      {
        accessorKey: "d_serv2",
        header: "Servicio 2",
        size: 100,
      },
      {
        accessorKey: "d_serv3",
        header: "Servicio 3",
        size: 100,
      },
      {
        accessorKey: "d_serv4",
        header: "Servicio 4",
        size: 100,
      },
      {
        accessorKey: "d_serv5",
        header: "Servicio 5",
        size: 100,
      },
    ],
    []
  );

  const columnsPromoDias = useMemo(
    () => [
      {
        accessorKey: "lu",
        header: "L",
        size: 25,
        Cell: ({ row }) => {
          if (row.original.lu === true) {
            return <Input type="checkbox" disabled="disabled" checked="checked" />;
          } else {
            return <Input type="checkbox" disabled="disabled" />;
          }
        },
      },
      {
        accessorKey: "ma",
        header: "M",
        size: 25,
        Cell: ({ row }) => {
          if (row.original.ma === true) {
            return <Input type="checkbox" disabled="disabled" checked="checked" />;
          } else {
            return <Input type="checkbox" disabled="disabled" />;
          }
        },
      },
      {
        accessorKey: "mi",
        header: "Mi",
        size: 25,
        Cell: ({ row }) => {
          if (row.original.mi === true) {
            return <Input type="checkbox" disabled="disabled" checked="checked" />;
          } else {
            return <Input type="checkbox" disabled="disabled" />;
          }
        },
      },
      {
        accessorKey: "ju",
        header: "J",
        size: 25,
        Cell: ({ row }) => {
          if (row.original.ju === true) {
            return <Input type="checkbox" disabled="disabled" checked="checked" />;
          } else {
            return <Input type="checkbox" disabled="disabled" />;
          }
        },
      },
      {
        accessorKey: "vie",
        header: "V",
        size: 25,
        Cell: ({ row }) => {
          if (row.original.vie === true) {
            return <Input type="checkbox" disabled="disabled" checked="checked" />;
          } else {
            return <Input type="checkbox" disabled="disabled" />;
          }
        },
      },
      {
        accessorKey: "sa",
        header: "S",
        size: 25,
        Cell: ({ row }) => {
          if (row.original.sa === true) {
            return <Input type="checkbox" disabled="disabled" checked="checked" />;
          } else {
            return <Input type="checkbox" disabled="disabled" />;
          }
        },
      },
      {
        accessorKey: "dom",
        header: "D",
        size: 25,
        Cell: ({ row }) => {
          if (row.original.dom === true) {
            return <Input type="checkbox" disabled="disabled" checked="checked" />;
          } else {
            return <Input type="checkbox" disabled="disabled" />;
          }
        },
      },
    ],
    []
  );
  const putVentaAgenda = async (idVenta, horaInicio, horafinal, estilista, tiempo) => {
    peinadosApi
      .put("/sp_detalleVentasUpdAgenda", null, {
        params: {
          idVenta: idVenta,
          horaInicio: horaInicio,
          horafinal: horafinal,
          estilista: estilista,
          tiempo: tiempo,
        },
      })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "Exito",
          text: "Se actualizo correctamente",
        });
        getCitasDia();
        // window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  function convertirMinutosAHorasYMinutos(minutos) {
    var horas = Math.floor(minutos / 60);
    var minutosRestantes = minutos % 60;
    return horas + ":" + (minutosRestantes < 10 ? "0" : "") + minutosRestantes + " Hrs";
  }
  return (
    <>
      {/* <div className="barra-titulo">
        <h1 className="logoBar">Peinados Express</h1>
      </div> */}
      <div className="contenedor-principal">
        <div className="timer">
          <div className="estilo-timer">
            <Timer />
          </div>
        </div>
        <Row></Row>
      </div>

      <div style={{ flex: 1, justifyContent: "right", alignContent: "right", alignItems: "right", display: "flex" }}></div>

      <div className="container">
        <div className="nBarra">
          <div className="botones-barra" style={{ justifyContent: "space-between", alignItems: "center", display: "flex", paddingTop: 10 }}>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
              <Button size="sm" href="http://cbinfo.no-ip.info:9020/Ventas" color="success">
                <FaMoneyBillAlt size={20}></FaMoneyBillAlt>
                Ventas
              </Button>
              <Button size="sm" onClick={() => setProductosModalLectura(true)} color="warning">
                <MdOutlinePriceCheck size={20}></MdOutlinePriceCheck>
                Precios
              </Button>
              <Button size="sm" onClick={() => setModalPromociones(true)} color="primary">
                <RiDiscountPercentLine size={20}></RiDiscountPercentLine>
                Promociones
              </Button>
              <Button onClick={() => setModalCumpleanios(true)} size="sm">
                <FaBirthdayCake size={20}></FaBirthdayCake>
              </Button>
            </ButtonGroup>
            <ButtonGroup variant="contained" aria-label="outlined primary button group">
              <Button
                color="info"
                onClick={() =>
                  handleOpenAgenda2({
                    idRec: dataEvent.idRec,
                    idSuc: idSuc,
                    suc: dataEvent.d_sucursal,
                  })
                }
              >
                <AiFillBook size={20} />
                Agenda2
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setModalCrear(true);
                  return;
                  handleOpenNewWindowNewSchedule();
                  setIsModalActualizarOpen(true);
                }}
              >
                <IoIosAddCircle size={20}></IoIosAddCircle>
                Nueva Cita
              </Button>

              <Button
                size="sm"
                color={"primary"}
                onClick={() => {
                  setIsModalActualizarOpen(true);
                  // setIsModalOpen(true);
                  handleOpenNewWindowListaEspera();
                }}
              >
                <IoListCircle size={20}></IoListCircle>
                Lista de espera
              </Button>
              <Button
                size="sm"
                color={"warning"}
                onClick={() => {
                  window.location.reload();
                }}
              >
                <IoRefreshCircle size={22}></IoRefreshCircle>
              </Button>
              <Button
                size="sm"
                color={"success"}
                onClick={() => {
                  setModalCitas(true);
                }}
              >
                <FaEye size={20}></FaEye>
                Mostrar citas
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      <div style={{ marginLeft: "0%" }}>
        {state.showScheduler && (
          <Scheduler
            key={1}
            schedulerData={state.viewModel}
            prevClick={prevClick}
            nextClick={nextClick}
            onSelectDate={onSelectDate}
            onViewChange={onViewChange}
            viewEventClick={ops1}
            viewEventText="Editar cita:"
            viewEvent2Text="Seleccionar opciones"
            viewEvent2Click={ops2}
            updateEventStart={updateEventStart}
            updateEventEnd={updateEventEnd}
            moveEvent={moveEvent}
            newEvent={newEvent}
            onScrollLeft={onScrollLeft}
            onScrollRight={onScrollRight}
            onScrollTop={onScrollTop}
            onScrollBottom={onScrollBottom}
            toggleExpandFunc={toggleExpandFunc}
          />
        )}
      </div>
      <div className="cardEstatus">
        <div
          style={{ marginBottom: "10px", marginTop: "2%", display: "flex", justifyItems: "center", alignItems: "center", flexDirection: "column" }}
        >
          <div style={statusBoxStyle}>
            <div style={boxStyles.noDisponible}>NO DISPONIBLE</div>
            <div style={boxStyles.requerido}>REQUERIDO</div>
            <div style={boxStyles.asignado}>ASIGNADO</div>
            <div style={boxStyles.enServicio}>EN SERVICIO</div>
            <div style={boxStyles.domicilio}>DOMICILIO</div>
            <div style={boxStyles.conflicto}>CONFLICTO</div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>
              ×
            </button>
            <h2>Seleccione la accion</h2>
            <Button
              color="danger"
              style={{ marginBottom: "10px" }}
              onClick={() => {
                if (event.hora1 < new Date()) {
                  Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "No se puede cancelar una cita pasada ",
                  });
                }
                putDetalleCitasServiciosUpd4(0, event.sucursal, event.idCita, 0, event.no_estilista, 0, 0, idUser, 0, 0, new Date());
                setIsModalOpen(false);
              }}
            >
              Cancelar cita
            </Button>
            <Button onClick={() => setIsModalOpen(false)} style={{ marginBottom: "10px" }}>
              Liberar servicio
            </Button>
            <Button
              color="success"
              onClick={() => {
                setFormCitaServicio({
                  ...formCitaServicio,
                  idCita: event.idCita,
                });
                setFormCita({
                  ...formCita,
                  no_cliente: event.no_cliente,
                  fecha: event.hora1,
                  no_estilista: event.no_estilista,
                  esServicioDomicilio: event.esDomicilio,
                  estatusCita: event.estadoCita,
                });
                setEvent({ ...event, hora1: new Date() });
                setIsModalOpen(false);
                setModalServicioUso(true);
              }}
              style={{ marginBottom: "10px" }}
            >
              Alta de servicio
            </Button>
            <Button
              color="primary"
              onClick={() => {
                setIsModalOpen(false);
                handleOpenNewWindowEdit({
                  idCita: event.idCita,
                  idUser: event.no_estilista,
                  idCliente: event.no_cliente,
                  fecha: event.hora1,
                  flag: 1,
                  estadoCita: event.estadoCita2,
                  tiempo: event.tiempo,
                  idSuc: idSuc,
                  nombreCliente: event.nombre,
                });
              }}
              style={{ marginBottom: "10px" }}
            >
              Cambio modo de cita
            </Button>
          </div>
        </div>
      )}

      {/* {isModalActualizarOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Button className="close-button" onClick={setIsModalActualizarOpen(false)}>
              ×
            </Button>
            <br />
            <Button
              color="primary"
              style={{ marginBottom: "10px" }}
              onClick={() => {
                window.location.reload();
              }}
            >
              Actualizar agenda
            </Button>
          </div>
        </div>
      )} */}

      <Modal
        open={isModalActualizarOpen}
        onClose={() => {
          setIsModalActualizarOpen(false);
        }}
      >
        <Box>
          <Button className="close-button" onClick={() => setIsModalActualizarOpen(false)}>
            ×
          </Button>
          <br />
          <Button color="primary" style={{ marginBottom: "10px" }} onClick={() => window.location.reload()}>
            Actualizar agenda
          </Button>
        </Box>
      </Modal>

      <Modal open={clientesModal} onClose={() => setClientesModal(false)}>
        <Box sx={style}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AiOutlineClose onClick={() => setClientesModal(false)} />
          </div>
          <Typography variant="h4">Seleccionar cliente</Typography>
          <MaterialReactTable
            columns={columnsClientes2}
            data={dataClientes}
            initialState={{ density: "compact" }}
            muiTableContainerProps={{ sx: { maxHeight: "500px", overflow: "auto" } }}
            muiTableBodyProps={{ sx: { fontSize: "16px" } }}
            muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
            muiTableBodyCellProps={{
              sx: {
                fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
              },
            }}
          />
        </Box>
      </Modal>
      <Draggable>
        <Modal open={modalCitas} onClose={() => setModalCitas(false)} disableAutoFocus disableEnforceFocus>
          <Box sx={style}>
            <div style={{ height: "2%", display: "table", tableLayout: "fixed", width: "100%" }}>
              <h3>Tabla de citas</h3>
              <Col sm={6}>
                <InputGroup style={{ marginBottom: "5px" }}>
                  <Label className="label-fixed-width" style={{ fontSize: "1.2rem" }}>
                    Tipo de cita:{" "}
                  </Label>
                  <Input style={{ fontSize: "1.2rem" }} type="select" size={"sm"} value={tipoCita} onChange={(e) => setTipoCita(e.target.value)}>
                    <option value={"%"}>Todos</option>
                    <option value={"1"}>Cita</option>
                    <option value={"2"}>Servicio</option>
                    <option value={"3"}>Pagado</option>
                  </Input>
                </InputGroup>

                <div>
                  <InputGroup style={{ marginBottom: "5px" }}>
                    <Label className="label-fixed-width" style={{ fontSize: "1.2rem" }}>
                      Nombre cliente:
                    </Label>
                    <Input
                      style={{ fontSize: "1.2rem" }}
                      onChange={(v) => setDatosParametros({ ...datosParametros, nombreCliente: v.target.value })}
                      size={"sm"}
                      value={datosParametros.nombreCliente}
                    ></Input>
                  </InputGroup>
                  <InputGroup style={{ marginBottom: "5px" }}>
                    <Label className="label-fixed-width" style={{ fontSize: "1.2rem" }}>
                      Nombre estilista:
                    </Label>
                    <Input
                      style={{ fontSize: "1.2rem" }}
                      onChange={(v) => setDatosParametros({ ...datosParametros, nombreEstilista: v.target.value })}
                      size={"sm"}
                      value={datosParametros.nombreEstilista}
                    ></Input>
                    <Button color="primary" size="sm">
                      <AiOutlineSearch size={19} onClick={() => getCitasDia()} />
                    </Button>
                    <Button color="secondary" size="sm">
                      <AiOutlineReload
                        size={19}
                        onClick={() => {
                          setDatosParametros({ ...datosParametros, nombreCliente: "", nombreEstilista: "" });
                          getCitasDia(1);
                        }}
                      />
                    </Button>
                  </InputGroup>
                </div>
              </Col>
              <br />
              <ThemeProvider theme={theme}>
                <DataGrid
                  rows={arregloCitaDia}
                  columns={columns2}
                  getRowId={(row) => row.idServicio + row.no_cliente2 + row.importe + row.id + new Date(row.horafinal)}
                  onCellDoubleClick={handleCellDoubleClick}
                  rowHeight={28}
                  columnHeaderHeight={28}
                  sx={{
                    "& .MuiDataGrid-pagination": {
                      height: "10px",
                    },
                  }}
                />
              </ThemeProvider>
            </div>
          </Box>
        </Modal>
      </Draggable>

      <Modal open={modalServicioUso} onClose={() => setModalServicioUso(false)} disableAutoFocus disableRestoreFocus disableEnforceFocus>
        <Box sx={styleAltaServicio}>
          <h3>Alta de servicio</h3>

          <Container>
            <Row style={{ marginBottom: "10px" }}>
              <Col>
                <h4>Confirme datos: </h4>
              </Col>
              <Col>
                <InputGroup>
                  <Label style={{ fontSize: "1.2rem", minWidth: "90px" }} for="fecha">
                    Fecha:
                  </Label>
                  <Input
                    style={{ fontSize: "1.2rem" }}
                    disabled
                    type="datetime"
                    name="fecha"
                    id="fecha"
                    value={event?.fecha ? format(new Date(event?.fecha), "yyyy-MMMM-dd", { locale: es }) : ""}
                  />
                </InputGroup>
              </Col>
            </Row>
            <Row style={{ marginBottom: "10px" }}>
              <InputGroup>
                <Label style={{ fontSize: "1.2rem", minWidth: "70px" }} for="cliente">
                  Cliente:{" "}
                </Label>
                <Input
                  style={{ fontSize: "1.2rem" }}
                  bsSize="sm"
                  disabled
                  value={event?.no_cliente ? dataClientes.find((cliente) => cliente.id == event?.no_cliente)?.nombre : ""}
                  type="text"
                  name="cliente"
                  id="cliente"
                  size={"small"}
                />
              </InputGroup>
            </Row>
            <Row style={{ marginBottom: "10px" }}>
              <Col xs={6}>
                <InputGroup>
                  <Label style={{ fontSize: "1.2rem", minWidth: "70px" }}>Modo:</Label>
                  <Input style={{ fontSize: "1.2rem" }} disabled value={event?.estadoCita == 2 ? "R" : "A"}></Input>
                </InputGroup>
              </Col>
              <Col xs={6}>
                <InputGroup>
                  <Label style={{ fontSize: "1.2rem", minWidth: "90px" }}>Tiempo:</Label>
                  <Input
                    style={{ fontSize: "1.2rem" }}
                    disabled
                    value={
                      dataCitasServicios.length > 0
                        ? dataCitasServicios.reduce((acc, service) => acc + Number(service.tiempo) * Number(service.cantidad), 0)
                        : ""
                    }
                  ></Input>
                </InputGroup>
              </Col>
            </Row>
            <Row style={{ marginBottom: "10px" }}>
              <Col xs={6}>
                <FormGroup style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                  <Label style={{ fontSize: "1.2rem", minWidth: "70px" }} for="cliente">
                    Hora:
                  </Label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      timeSteps={{ minutes: 15 }}
                      slotProps={{ textField: { size: "small" } }}
                      value={event?.hora1 ? new Date(event?.hora1) : null}
                      onChange={(hora) => handleChangeFechaEvent("hora", hora)}
                      sx={{
                        "& .MuiInputBase-input": {
                          width: "128px",
                        },
                        "& .MuiPickersDay-dayWithMargin": {
                          // Oculta el ícono del DatePicker
                          display: "none",
                        },
                        "& .MuiSvgIcon-root": {
                          // Aquí se oculta el ícono
                          width: "1.2rem",
                        },
                      }}
                      renderInput={(props) => (
                        <Input
                          {...props}
                          size="small"
                          style={{
                            fontSize: "1.1rem",
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </FormGroup>
              </Col>
              <Col xs={6}>
                <InputGroup>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Label style={{ fontSize: "1.2rem", minWidth: "90px" }}>Atiende:</Label>
                    <Input
                      bsSize="sm"
                      type="select"
                      name="atiende"
                      id="atiende"
                      value={event?.no_estilista}
                      onChange={(e) => setEvent({ ...event, no_estilista: e.target.value })}
                      style={{ fontSize: "1.2rem" }}
                    >
                      <option value="0">Seleccione un estilista</option>
                      {dataEstilistas.map((opcion, index) => (
                        <option value={opcion.id} key={index}>
                          {opcion.estilista}
                        </option>
                      ))}
                    </Input>
                  </div>
                </InputGroup>
              </Col>
            </Row>
          </Container>
          <br />
          <Button color="primary" onClick={() => setProductosModal(true)}>
            Ingresar servicios
          </Button>
          <ThemeProvider theme={theme}>
            <DataGrid autoHeight rows={dataCitasServicios} columns={columnsCitasServiciosAltaServicio}></DataGrid>
          </ThemeProvider>
          <br />
          <Container style={{ display: "flex", justifyContent: "flex-end" }}>
            <ButtonGroup>
              <Button
                style={{ marginRight: "10px" }}
                color="primary"
                disabled={dataCitasServicios.length == 0}
                onClick={() => {
                  let fecha1 = new Date(event.hora1);
                  let fecha2 = new Date();
                  let diferenciaEnMinutos = Math.abs(fecha2.getTime() - fecha1.getTime()) / 1000 / 60;
                  let hora1 = diferenciaEnMinutos > 5 || diferenciaEnMinutos < -5 ? event.hora1 : new Date();
                  verificarDisponibilidad(
                    dataCitasServicios.length > 0
                      ? dataCitasServicios.reduce((acc, service) => acc + Number(service.tiempo) * Number(service.cantidad), 0)
                      : "",
                    hora1,
                    event?.no_estilista,
                    formCitaServicio.idCita
                  ).then((isVerified) => {
                    if (isVerified) {
                      updateCita();
                    } else {
                      return;
                    }
                  });
                  setModalServicioUso(false);
                  setModalCitaEditEstilista(false);
                  setModalCitas(false);
                }}
              >
                Guardar
              </Button>
              <Button color="danger" onClick={() => setModalServicioUso(false)}>
                Salir
              </Button>
            </ButtonGroup>
          </Container>
        </Box>
      </Modal>
      <Modal open={productosModal} onClose={() => setProductosModal(false)}>
        <Box sx={styleAltaServicio}>
          <Typography variant="h4">Agregar productos</Typography>
          {/* <DataGrid rows={dataProductos} columns={columnsProductos} /> */}
          {dataProductos ? (
            <MaterialReactTable
              columns={columnsProductosMRT}
              data={dataProductos}
              initialState={{ density: "compact", pagination: { pageSize: 7, pageIndex: 0 } }}
              muiTableContainerProps={{ sx: { maxHeight: "330px" } }}
              muiTableBodyProps={{ sx: { fontSize: "16px" } }}
              muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
              muiTableBodyCellProps={{
                sx: {
                  fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
                },
              }}
            />
          ) : null}
        </Box>
      </Modal>
      <Modal open={productosModalLectura} onClose={() => setProductosModalLectura(false)}>
        <Box sx={styleAltaServicio}>
          <Typography variant="h4">Lectura productos</Typography>
          {/* <DataGrid rows={dataProductos} columns={columnsProductos} /> */}
          {dataProductos ? (
            <MaterialReactTable
              columns={columnsProductosMRTLectura}
              data={dataProductos}
              initialState={{ density: "compact", pagination: { pageSize: 7, pageIndex: 0 } }}
              muiTableContainerProps={{ sx: { maxHeight: "400px" } }}
              muiTableBodyProps={{ sx: { fontSize: "16px" } }}
              muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
              muiTableBodyCellProps={{
                sx: {
                  fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
                },
              }}
            />
          ) : null}
        </Box>
      </Modal>
      <Modal open={productosModalGrupos} onClose={() => setproductosModalGrupos(false)}>
        <Box sx={styleAltaServicio}>
          <Typography variant="h4">Productos del grupo</Typography>
          {/* <DataGrid rows={dataProductos} columns={columnsProductos} /> */}
          {dataProductos ? (
            <MaterialReactTable
              columns={columnsProductosMRTLectura}
              data={dataProductosAreaDeptoSub}
              initialState={{ density: "compact", pagination: { pageSize: 7, pageIndex: 0 } }}
              muiTableContainerProps={{ sx: { maxHeight: "400px" } }}
              muiTableBodyProps={{ sx: { fontSize: "16px" } }}
              muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
              state={{ isLoading: dataProductosAreaDeptoSub.length == 0 }}
              muiTableBodyCellProps={{
                sx: {
                  fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
                },
              }}
            />
          ) : null}
        </Box>
      </Modal>

      <Modal open={modalCitasObservaciones} onClose={() => setModalCitasObservaciones(false)}>
        <Box sx={styleObservaciones}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AiOutlineClose onClick={() => setModalCitasObservaciones(false)} />
          </div>
          <Typography variant="h4">Observaciones del catalogo</Typography>
          <ThemeProvider theme={theme}>
            <DataGrid
              autoHeight
              rows={dataObservaciones}
              columns={columnsObservaciones}
              pageSize={3} // Número de filas por página
              rowsPerPageOptions={[3]} // Opciones de filas por página en el dropdown
              pagination
            ></DataGrid>
          </ThemeProvider>
        </Box>
      </Modal>

      <Modal open={ModalClientesPuntos} onClose={() => setModalClientesPuntos(false)}>
        <Box sx={style}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AiOutlineClose onClick={() => setModalClientesPuntos(false)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4">Historial de puntos</Typography>
            <h5> Total de puntos: {dataPuntosporCliente[0]?.puntosTotal}</h5>
          </div>
          <hr />
          <Label>Cliente:</Label>
          <Input disabled value={formCitaDescripciones.descripcion_no_cliente}></Input>
          <ThemeProvider theme={theme}>
            <DataGrid autoHeight rows={dataClientesPuntos} columns={columnsPuntos} />
          </ThemeProvider>
        </Box>
      </Modal>

      <Modal open={ModalOperacionesPuntos} onClose={() => setModalOperacionesPuntos(false)}>
        <Box sx={styleAltaServicio}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AiOutlineClose onClick={() => setModalOperacionesPuntos(false)} />
          </div>
          <Typography variant="h4">Consulta de operaciones</Typography>
          <Label>Cliente:</Label>
          <Input style={{ marginBottom: "10px" }} disabled value={formCitaDescripciones.descripcion_no_cliente}></Input>
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <Label>Suc: {formPuntosObservaciones.sucursal ? formPuntosObservaciones.sucursal : ""}</Label>
            <Label>Fecha: {formPuntosObservaciones.fecha ? format(new Date(formPuntosObservaciones.fecha), "dd/MM/yyyy HH:mm") : ""} </Label>
            <Label>Hora: {formPuntosObservaciones.fecha ? format(new Date(formPuntosObservaciones.fecha), "HH:mm") : ""}</Label>
          </div>
          <ThemeProvider theme={theme}>
            <DataGrid autoHeight rows={dataOperaciones} columns={columnsConultaPuntos} />
          </ThemeProvider>

          <hr />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Button
              onClick={() => {
                setModalOperacionesPuntos(false);
              }}
            >
              Salir
            </Button>
            <div>
              <Label>Total: </Label>
              <Input value={totalOperacionesPuntos} disabled></Input>
            </div>
          </div>
        </Box>
      </Modal>

      {/* <Modal open={productosModal} onClose={() => setProductosModal(false)}>
        <Box sx={style}>
          <Typography variant="h4">Agregar productos</Typography>
          <DataGrid rows={dataProductos} columns={columnsProductos} />
        </Box>
      </Modal> */}

      <Modal open={verificarContraModal} onClose={() => setVerificarContraModal(false)}>
        <Box sx={style}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AiOutlineClose onClick={() => setVerificarContraModal(false)} />
          </div>
          <Label>Ingrese su contraseña</Label>
          <Input onChange={handleChange} type="password"></Input>
          <Button onClick={validarContraseña}>Guardar</Button>
        </Box>
      </Modal>

      <Modal open={puntosModal} onClose={() => setPuntosModal(false)}>
        <Box sx={styleAltaServicio}>
          <Typography variant="h4">Agregar productos</Typography>
          <ThemeProvider theme={theme}>
            <DataGrid rows={dataClientesPuntos} columns={columnsProductos} />
          </ThemeProvider>
        </Box>
      </Modal>

      <Modal open={ModalVentasHistorial} onClose={() => setModalVentasHistorial(false)}>
        <Box sx={style}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <AiOutlineClose onClick={() => setModalVentasHistorial(false)} />
          </div>
          <Typography variant="h4">Historial de ventas</Typography>
          <Row style={{ marginTop: "18px" }}>
            <Col md={1}>
              <Label>Cliente:</Label>
            </Col>

            <Col md={6}>
              <Input
                disabled
                placeholder="nombreCliente"
                value={formCitaDescripciones.descripcion_no_cliente ? formCitaDescripciones.descripcion_no_cliente : ""}
              ></Input>
            </Col>
          </Row>
          <Row style={{ marginTop: "18px", marginBottom: "18px" }}>
            <Col md={1}>
              <Label>Estilista:</Label>
            </Col>
            <Col md={4}>
              <Input
                type="select"
                name="atiende"
                id="atiende"
                value={formVentaHistoriales.userId}
                onChange={(e) => {
                  setFormVentaHistoriales({ ...formVentaHistoriales, userId: e.target.value });
                }}
              >
                <option value="0">Seleccione un estilista</option>

                {dataTrabajadores.map((opcion, index) => {
                  return (
                    <option value={opcion.id} key={index}>
                      {opcion.nombre}
                    </option>
                  );
                })}
              </Input>
            </Col>
            <Col md={1}>
              <Label>Servicio:</Label>
            </Col>
            <Col md={4}>
              <Input
                disabled
                value={formVentaHistoriales.claveProdDescripcion}
                onChange={(e) => setFormVentaHistoriales({ ...formVentaHistoriales, claveProd: e.target.value })}
                placeholder="Escoja un servicio"
              ></Input>
            </Col>
            <Col md={2}>
              <Button
                onClick={() => {
                  setFormVentaHistoriales({ ...formVentaHistoriales, botonConsultar: true });
                  setProductosModal(true);
                }}
              >
                {" "}
                Buscar
              </Button>
            </Col>
          </Row>
          <Row style={{ marginBottom: "18px" }}>
            <Col md={1}>
              <Label>Sucursal:</Label>
            </Col>
            <Col md={4}>
              <Input
                type="select"
                name="sucursal"
                id="sucursal"
                value={formVentaHistoriales.sucursal}
                onChange={(e) => {
                  setFormVentaHistoriales({ ...formVentaHistoriales, sucursal: e.target.value });
                }}
              >
                <option value="0">Seleccione un sucursal</option>

                {dataSucursales.map((opcion, index) => {
                  return (
                    <option value={opcion.sucursal} key={index}>
                      {opcion.descripcion}
                    </option>
                  );
                })}
              </Input>
            </Col>
            <Col md={1}>
              <Label>Del:</Label>
            </Col>
            <Col md={2}>
              <Input
                type="date"
                onChange={(e) => setFormVentaHistoriales({ ...formVentaHistoriales, fechaInicio: e.target.value })}
                placeholder="Del:"
              ></Input>
            </Col>
            <Col md={1}>
              <Label>Al:</Label>
            </Col>
            <Col md={2}>
              <Input
                type="date"
                onChange={(e) => setFormVentaHistoriales({ ...formVentaHistoriales, fechaFin: e.target.value })}
                placeholder="Al:"
              ></Input>
            </Col>
          </Row>
          <Button style={{ marginBottom: "18px" }} color="success" onClick={() => fetchVentasHistoriales()}>
            Consultar
          </Button>
          <ThemeProvider theme={theme}>
            <DataGrid
              rows={dataVentasHistoriales}
              columns={columnsDataVentasHistoriales}
              getRowId={(row) => Number(row.sucursal) + Number(row.no_venta)}
            />
          </ThemeProvider>
        </Box>
      </Modal>

      <Modal open={ModalVentasOperaciones} onClose={() => setModalVentasOperaciones(false)}>
        <Box sx={styleAltaServicio}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4">Consulta de operaciones</Typography>
            <AiOutlineClose onClick={() => setModalVentasOperaciones(false)} />
          </div>
          <Row>
            <Col md={12}>
              <FormGroup>
                <Label>Cliente:</Label>
                <Input
                  disabled
                  placeholder="nombreCliente"
                  value={formCitaDescripciones.descripcion_no_cliente ? formCitaDescripciones.descripcion_no_cliente : ""}
                ></Input>
              </FormGroup>
            </Col>
          </Row>
          <Row style={{ marginTop: "18px", marginBottom: "5px" }}>
            <Col md={1}>
              <Label>Sucursal:</Label>
            </Col>
            <Col md={3}>
              <Input disabled value={DataVentasOperaciones.length > 0 ? DataVentasOperaciones[0]?.d_sucursal : ""} placeholder="Sucursal"></Input>
            </Col>
            <Col md={1}>
              <Label>Fecha:</Label>
            </Col>
            <Col md={3}>
              <Input
                disabled
                value={format(formVentaOperaciones.fecha ? new Date(formVentaOperaciones.fecha) : new Date(), "yyyy-MM-dd HH:mm")}
                placeholder="Fecha"
              ></Input>
            </Col>
            <Col md={1}>
              <Label>Folio venta:</Label>
            </Col>
            <Col md={3}>
              <Input disabled value={formVentaOperaciones.no_venta} placeholder="No_venta"></Input>
            </Col>
          </Row>
          <div style={{ display: "flex", justifyContent: "jusify-between" }}>
            <h5>Operaciones</h5>
            <h5>
              Total de la venta: {DataVentasOperaciones.reduce((acc, service) => acc + Number(service.precio) * Number(service.cant_producto), 0)}
            </h5>
          </div>
          <ThemeProvider theme={theme}>
            <div style={{ height: "222px", width: "100%" }}>
              <DataGrid
                rows={DataVentasOperaciones}
                columns={columnsDataVentasOperaciones}
                initialState={{ density: "compact" }}
                hideFooter
                columnHeaders={false}
              />
            </div>
          </ThemeProvider>
          <br />
          <h5>Medios de pago usados</h5>
          <ThemeProvider theme={theme}>
            <div style={{ height: "222px", width: "100%" }}>
              <DataGrid
                rows={dataVentasOperacionesMediosPagos2}
                columns={columnsDataVentasOperacionesMedios}
                getRowId={(row) => Number(row.no_venta) + "" + row.descripcion}
                initialState={{ density: "compact" }}
                hideFooter
                columnHeaders={false}
              />
            </div>
          </ThemeProvider>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <p>,</p>
        </Box>
      </Modal>

      <Modal open={ProductosModalEdicion} onClose={() => setProductosModalEdicion(false)}>
        <Box sx={styleAltaServicio}>
          <Typography variant="h4">Agregar productos</Typography>
          {/* <DataGrid rows={dataProductos} columns={columnsProductos} /> */}
          {dataProductos ? (
            <MaterialReactTable
              columns={columnsProductosMRTEdicion}
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
          ) : null}
        </Box>
      </Modal>
      <Modal open={ProductosModalEdicionServicios} onClose={() => setProductosModalEdicionServicios(false)}>
        <Box sx={style}>
          <Typography variant="h4">Agregar productos</Typography>
          {/* <DataGrid rows={dataProductos} columns={columnsProductos} /> */}
          {dataProductos ? (
            <MaterialReactTable
              columns={columnsProductosMRTEdicionServicios}
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
          ) : null}
        </Box>
      </Modal>

      {/* Hazme un modal como lo he estado haciendo para que edite el estilista y el servicio, ingresando a su vez una cantidad */}
      <Modal
        open={modalEdicionServicios}
        onClose={() => setModalEdicionServicios(false)}
        disableAutoFocus
        disableEnforceFocus
        disableEscapeKeyDown
        disableRestoreFocus
        disableScrollLock
      >
        <Box sx={styleObservaciones}>
          <Row form>
            <Col md={6}>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="atiende">
                  Estilista
                </Label>
                <Input
                  type="select"
                  name="atiende"
                  id="atiende"
                  value={formDetalleCitasServicios.idEstilista}
                  onChange={(valor) => {
                    setFormDetalleCitasServicios({ ...formDetalleCitasServicios, idEstilista: valor.target.value });
                  }}
                >
                  <option value="0">Seleccione un estilista</option>
                  {dataEstilistas.map((opcion, index) => {
                    return (
                      <option value={opcion.id} key={index}>
                        {opcion.estilista}
                      </option>
                    );
                  })}
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="cliente" style={{ fontSize: "1.2rem" }}>
                  Producto
                </Label>
                <InputGroup addonType="append">
                  <Input bsSize="sm" disabled value={formDetalleCitasServicios.d_clave_prod} type="text" name="cliente" id="cliente" size={"small"} />
                  <Button size="sm" onClick={() => setProductosModalEdicion(true)}>
                    Buscar
                  </Button>
                </InputGroup>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }}>Cantidad</Label>
                <Input
                  value={formDetalleCitasServicios.cantidad}
                  onChange={(v) => {
                    setFormDetalleCitasServicios({ ...formDetalleCitasServicios, cantidad: v.target.value });
                  }}
                ></Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="fecha" style={{ fontSize: "1.2rem" }}>
                  Fecha:
                </Label>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    disabled
                    openPickerIcon={<Box />} // Aquí se elimina el ícono
                    slotProps={{ textField: { size: "small" } }}
                    style={{ height: 20, fontSize: "1.2rem" }}
                    value={formDetalleCitasServicios.fecha ? new Date(formDetalleCitasServicios.fecha) : null}
                    onChange={(fecha) => handleChangeFechaServicio("fecha", fecha)}
                    format="dd/MM/yyyy"
                    sx={{
                      "& .MuiInputBase-input": {
                        width: "128px",
                      },
                      "& .MuiPickersDay-dayWithMargin": {
                        // Oculta el ícono del DatePicker
                        display: "none",
                      },
                      "& .MuiSvgIcon-root": {
                        // Aquí se oculta el ícono
                        width: "1.2rem",
                        backgroundColor: "transparent",
                      },
                      "& .MuiIconButton-root": {
                        marginRight: "-16px",
                      },
                    }}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        size="small"
                        InputProps={{ endAdornment: null }} // Aquí se elimina el ícono
                        sx={{
                          fontSize: "1.2rem",
                          "& .MuiInputBase-input": {
                            height: "30px", // Ajusta la altura aquí
                            padding: "0 14px", // Ajusta el padding para centrar el texto
                          },
                          "& .MuiOutlinedInput-root": {
                            height: "30px", // Ajusta la altura aquí
                            padding: "0px", // Remueve el padding interno
                          },
                          "& .MuiOutlinedInput-input": {
                            height: "30px", // Ajusta la altura aquí
                            display: "flex",
                            alignItems: "center",
                          },
                          "& .MuiInputAdornment-root": {
                            height: "30px", // Asegura que los adornos tengan la misma altura
                            "& button": {
                              height: "30px", // Ajusta la altura del botón del ícono
                            },
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="fecha" style={{ fontSize: "1.2rem", marginRight: "5px" }}>
                  Hora de cita:
                </Label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    timeSteps={{ minutes: 15 }}
                    slotProps={{ textField: { size: "small" } }}
                    value={formDetalleCitasServicios.fecha ? new Date(decodeURIComponent(formDetalleCitasServicios.fecha)) : null}
                    // value={formCita.fecha ? new Date(formCita.fecha).toTimeString().substring(0, 5) : null}
                    onChange={(hora) => handleChangeFechaServicio("hora", hora)}
                    sx={{
                      "& .MuiInputBase-input": {
                        width: "128px",
                      },
                      "& .MuiPickersDay-dayWithMargin": {
                        // Oculta el ícono del DatePicker
                        display: "none",
                      },
                      "& .MuiSvgIcon-root": {
                        // Aquí se oculta el ícono
                        width: "1.2rem",
                      },
                    }}
                    renderInput={(props) => (
                      <Input
                        {...props}
                        size="small"
                        style={{
                          fontSize: "1.2rem",
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }}>Tiempo</Label>
                <Input
                  style={{ fontSize: "1.2rem" }}
                  value={formDetalleCitasServicios.tiempo}
                  onChange={(e) => setFormDetalleCitasServicios({ ...formDetalleCitasServicios, tiempo: e.target.value })}
                ></Input>
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Button
                  color="success"
                  onClick={() => {
                    putDetalleCitasServiciosUpd4(
                      formDetalleCitasServicios.id,
                      idSuc, //SUCURSAL: 1 SUCURSAL: 2
                      formCitaServicio.idCita,
                      formDetalleCitasServicios.tiempo,
                      formDetalleCitasServicios.idEstilista,
                      1,
                      formDetalleCitasServicios.idServicio,
                      idUser,
                      formDetalleCitasServicios.cantidad,
                      formDetalleCitasServicios.precio,
                      formDetalleCitasServicios.fecha
                    );
                  }}
                >
                  Guardar
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </Box>
      </Modal>
      <Modal
        open={modalEdicionServicios2}
        onClose={() => setModalEdicionServicios2(false)}
        disableAutoFocus
        disableEnforceFocus
        disableEscapeKeyDown
        disableRestoreFocus
        disableScrollLock
      >
        <Box sx={styleObservaciones}>
          <Row form>
            <Col md={3}>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }} for="atiende">
                  Seleccione un estilista
                </Label>
                <Input
                  type="select"
                  name="atiende"
                  style={{ fontSize: "1.2rem" }}
                  id="atiende"
                  value={formDetalleCitasServicios.idEstilista}
                  onChange={(valor) => {
                    setFormDetalleCitasServicios({ ...formDetalleCitasServicios, idEstilista: valor.target.value });
                  }}
                >
                  <option value="0">Seleccione un estilista</option>
                  {dataEstilistas.map((opcion, index) => {
                    return (
                      <option value={opcion.id} key={index}>
                        {opcion.estilista}
                      </option>
                    );
                  })}
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="cliente" style={{ fontSize: "1.2rem" }}>
                  Producto
                </Label>
                <InputGroup addonType="append">
                  <Input
                    style={{ fontSize: "1.2rem" }}
                    bsSize="sm"
                    disabled
                    value={formDetalleCitasServicios.d_clave_prod}
                    type="text"
                    name="cliente"
                    id="cliente"
                    size={"small"}
                  />
                  <Button size="sm" onClick={() => setProductosModalEdicion(true)}>
                    Buscar
                  </Button>
                </InputGroup>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="cliente" style={{ fontSize: "1.2rem" }}>
                  Cantidad
                </Label>
                <InputGroup addonType="append">
                  <Input
                    style={{ fontSize: "1.2rem" }}
                    bsSize="sm"
                    value={formDetalleCitasServicios.cantidad}
                    type="text"
                    name="cliente"
                    id="cliente"
                    size={"small"}
                  />
                </InputGroup>
              </FormGroup>
            </Col>

            <Col md={3}>
              <FormGroup>
                <Label style={{ fontSize: "1.2rem" }}>Tiempo</Label>
                <Input
                  style={{ fontSize: "1.2rem" }}
                  value={formDetalleCitasServicios.tiempo}
                  onChange={(v) => {
                    setFormDetalleCitasServicios({ ...formDetalleCitasServicios, tiempo: v.target.value });
                  }}
                ></Input>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="fecha" style={{ fontSize: "1.2rem", marginRight: 20 }}>
                  Fecha de cita:
                </Label>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    disabled
                    openPickerIcon={<Box />} // Aquí se elimina el ícono
                    slotProps={{ textField: { size: "small" } }}
                    style={{ height: 20 }}
                    value={formDetalleCitasServicios.fecha ? new Date(formDetalleCitasServicios.fecha) : null}
                    onChange={(fecha) => handleChangeFechaServicio("fecha", fecha)}
                    format="dd/MM/yyyy"
                    sx={{
                      "& .MuiInputBase-input": {
                        width: "160px",
                      },
                      "& .MuiPickersDay-dayWithMargin": {
                        // Oculta el ícono del DatePicker
                        display: "none",
                      },
                      "& .MuiSvgIcon-root": {
                        // Aquí se oculta el ícono
                        width: "1.2rem",
                        backgroundColor: "transparent",
                      },
                      "& .MuiIconButton-root": {
                        marginRight: "-16px",
                      },
                    }}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        size="small"
                        InputProps={{ endAdornment: null }} // Aquí se elimina el ícono
                        sx={{
                          fontSize: "1.2rem",
                          "& .MuiInputBase-input": {
                            height: "30px", // Ajusta la altura aquí
                            padding: "0 14px", // Ajusta el padding para centrar el texto
                          },
                          "& .MuiOutlinedInput-root": {
                            height: "30px", // Ajusta la altura aquí
                            padding: "0px", // Remueve el padding interno
                          },
                          "& .MuiOutlinedInput-input": {
                            height: "30px", // Ajusta la altura aquí
                            display: "flex",
                            alignItems: "center",
                          },
                          "& .MuiInputAdornment-root": {
                            height: "30px", // Asegura que los adornos tengan la misma altura
                            "& button": {
                              height: "30px", // Ajusta la altura del botón del ícono
                            },
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </FormGroup>
            </Col>
            <Col md={3}>
              <InputGroup>
                <Label for="fecha" style={{ fontSize: "1.2rem", marginRight: "5px" }}>
                  Hora de cita:
                </Label>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    timeSteps={{ minutes: 15 }}
                    slotProps={{ textField: { size: "small" } }}
                    value={formDetalleCitasServicios.fecha ? new Date(decodeURIComponent(formDetalleCitasServicios.fecha)) : null}
                    // value={formCita.fecha ? new Date(formCita.fecha).toTimeString().substring(0, 5) : null}
                    onChange={(hora) => handleChangeFechaServicio("hora", hora)}
                    sx={{
                      "& .MuiInputBase-input": {
                        width: "160px",
                      },
                      "& .MuiPickersDay-dayWithMargin": {
                        // Oculta el ícono del DatePicker
                        display: "none",
                      },
                      "& .MuiSvgIcon-root": {
                        // Aquí se oculta el ícono
                        width: "1.2rem",
                      },
                    }}
                    renderInput={(props) => (
                      <Input
                        {...props}
                        size="small"
                        style={{
                          fontSize: "1.2rem",
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </InputGroup>
            </Col>
            <Col md="3">
              <Label style={{ fontSize: "1.2rem" }}>Estatus Cita</Label>
              <ButtonGroup>
                <Input style={{ fontSize: "1.2rem" }} disabled value={formDetalleCitasServicios.estatusCita == 2 ? "A" : "R"}></Input>
                <Button
                  onClick={() =>
                    setFormDetalleCitasServicios({ ...formDetalleCitasServicios, estatusCita: formDetalleCitasServicios.estatusCita == 2 ? 3 : 2 })
                  }
                >
                  Editar
                </Button>
              </ButtonGroup>
            </Col>

            <Col md={6}>
              <div style={{ display: "flex", alignItems: "flex-end", marginBottom: "5px" }}>
                <FormGroup>
                  <Button
                    color="success"
                    onClick={() => {
                      putDetalleCitasServiciosUpd7(
                        formDetalleCitasServicios.id,
                        idSuc, //SUCURSAL: 1 SUCURSAL: 2
                        formCitaServicio.idCita,
                        formDetalleCitasServicios.tiempo,
                        formDetalleCitasServicios.idEstilista,
                        1,
                        formDetalleCitasServicios.idServicio,
                        idUser,
                        formDetalleCitasServicios.cantidad,
                        formDetalleCitasServicios.precio,
                        formDetalleCitasServicios.fecha,
                        formDetalleCitasServicios.estatusCita
                      );
                    }}
                  >
                    Guardar
                  </Button>
                </FormGroup>
              </div>
            </Col>
          </Row>
        </Box>
      </Modal>
      <Draggable>
        <Modal open={modalEdicionVenta} onClose={() => setModalEdicionVenta(false)} size={"sm"}>
          <Box sx={styleObservaciones}>
            <h3>Modificación ventas</h3>
            <Row>
              <Col>
                <Label for="atiende" style={{ marginRight: "0px", fontSize: "1.2rem" }}>
                  Atiende:
                </Label>
                <Input
                  bsSize="sm"
                  type="select"
                  name="atiende"
                  id="atiende"
                  value={formDetalleCitasServicios.idEstilista}
                  onChange={(e) => setFormDetalleCitasServicios({ ...formDetalleCitasServicios, idEstilista: parseInt(e.target.value) })}
                  style={{ marginBottom: "10px", fontSize: "1.2rem" }}
                >
                  <option value="0">Seleccione</option>
                  {dataTrabajadores.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre_agenda}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col>
                <FormGroup>
                  <Label style={{ fontSize: "1.2rem" }}>Tiempo</Label>
                  <Input
                    value={formDetalleCitasServicios.tiempo}
                    onChange={(v) => {
                      const fechaInicio = new Date(formDetalleCitasServicios.fecha);
                      const minutos = parseInt(v.target.value);
                      const fechaFinal = new Date(fechaInicio.getTime() + minutos * 60000);
                      setFormDetalleCitasServicios({ ...formDetalleCitasServicios, tiempo: v.target.value, fechaFinal });
                    }}
                  ></Input>
                </FormGroup>
              </Col>
            </Row>

            <Row style={{ marginBottom: "10px" }}>
              <Col>
                <FormControl>
                  <Label style={{ marginBottom: "10px", fontSize: "1.2rem" }} for="hora_inicio">
                    Hora inicio:
                  </Label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      timeSteps={15}
                      slotProps={{ textField: { size: "small" } }}
                      value={formDetalleCitasServicios.fecha ? new Date(decodeURIComponent(formDetalleCitasServicios.fecha)) : null}
                      onChange={(hora) => handleChangeFechaServicio("hora", hora)}
                      sx={{
                        "& .MuiPickersDay-dayWithMargin": {
                          display: "flex",
                        },
                        "& .MuiSvgIcon-root": {
                          width: "1.2rem",
                        },
                      }}
                      renderInput={(props) => (
                        <Input
                          {...props}
                          size="small"
                          style={{
                            fontSize: "1.2rem",
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Col>
              <Col>
                <FormControl>
                  <Label for="hora_final" style={{ marginRight: "4px", fontSize: "1.2rem" }}>
                    Hora final:
                  </Label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      disabled
                      timeSteps={15}
                      slotProps={{ textField: { size: "small" } }}
                      value={formDetalleCitasServicios.fechaFinal ? new Date(decodeURIComponent(formDetalleCitasServicios.fechaFinal)) : null}
                      onChange={(hora) => handleChangeFechaFinalServicio("hora", hora)}
                      sx={{
                        "& .MuiPickersDay-dayWithMargin": {
                          display: "none",
                        },
                        "& .MuiSvgIcon-root": {
                          width: "1.2rem",
                        },
                      }}
                      renderInput={(props) => (
                        <Input
                          {...props}
                          size="small"
                          style={{
                            fontSize: "1.2rem",
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </FormControl>
              </Col>
            </Row>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                color="success"
                onClick={() => {
                  putVentaAgenda(
                    event.idVenta,
                    formDetalleCitasServicios.fecha,
                    formDetalleCitasServicios.fechaFinal,
                    formDetalleCitasServicios.idEstilista,
                    formDetalleCitasServicios.tiempo
                  );
                }}
              >
                Guardar
              </Button>
            </div>
          </Box>
        </Modal>
      </Draggable>

      <Modal open={ModalCitaEditEstilista} onClose={() => setModalCitaEditEstilista(false)} size={"sm"} disableEnforceFocus>
        <Box sx={styleCantidad}>
          {colummEdit == "d_stilista" ? (
            <>
              <Label for="atiende" style={{ marginRight: "0px", fontSize: "1.2rem" }}>
                Atiende:
              </Label>
              <Input
                bsSize="sm"
                type="select"
                name="atiende"
                id="atiende"
                value={formCitaServioActualizacion?.idEstilista}
                onChange={(e) => setFormCitaServioActualizacion({ ...formCitaServioActualizacion, idEstilista: e.target.value })}
                style={{ fontSize: "1.2rem" }}
              >
                <option value="0">Seleccione un estilista</option>
                {dataEstilistas.map((opcion, index) => (
                  <option value={opcion.id} key={index}>
                    {opcion.estilista}
                  </option>
                ))}
              </Input>
            </>
          ) : null}

          {colummEdit == "stao_estilista" ? (
            <>
              <Input disabled style={{ fontSize: "1.2rem" }} value={formCitaServioActualizacion?.estatusCita == 2 ? "Requerido" : "Asignado"}></Input>
              <Button
                color="info"
                onClick={() =>
                  setFormCitaServioActualizacion({
                    ...formCitaServioActualizacion,
                    estatusCita: formCitaServioActualizacion.estatusCita == 2 ? 3 : 2,
                  })
                }
              >
                Cambio
              </Button>
            </>
          ) : null}
          {colummEdit == "hora_cita" ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Label style={{ marginRight: "4px", fontSize: "1.2rem" }}>Hora inicio</Label>
              <TimePicker
                timeSteps={{ minutes: 15 }}
                slotProps={{ textField: { size: "small" } }}
                value={formCitaServioActualizacion?.hora_cita ? new Date(decodeURIComponent(formCitaServioActualizacion?.hora_cita)) : null}
                // value={formCitaServioActualizacion?.hora_cita ? new Date(formCita.fecha).toTimeString().substring(0, 5) : null}
                onChange={(hora) => handleChangeFechaEdicionServicio("hora", hora)}
                sx={{
                  "& .MuiInputBase-input": {
                    width: "128px",
                  },
                  "& .MuiPickersDay-dayWithMargin": {
                    // Oculta el ícono del DatePicker
                    display: "none",
                  },
                  "& .MuiSvgIcon-root": {
                    // Aquí se oculta el ícono
                    width: "1.2rem",
                    backgroundColor: "#ffccac",
                  },
                }}
                renderInput={(props) => (
                  <Input
                    {...props}
                    size="small"
                    style={{
                      fontSize: "0.8rem",
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          ) : null}
          {colummEdit == "descripcion" ? (
            <>
              <Col>
                <Label style={{ marginRight: "4px", fontSize: "1.2rem" }}>Producto</Label>
              </Col>
              <Col>
                <Input style={{ fontSize: "1.2rem", marginBottom: "4px" }} value={formCitaServioActualizacion?.descripcion}></Input>
              </Col>
              <Col>
                <Button onClick={() => setProductosModalEdicionServicios(true)}>Cambio</Button>
              </Col>
              <Col>
                <Label style={{ marginRight: "4px", fontSize: "1.2rem" }}>Tiempo</Label>
              </Col>
              <Col>
                <Input
                  style={{ fontSize: "1.2rem" }}
                  value={formCitaServioActualizacion?.tiempo}
                  onChange={(e) => setFormCitaServioActualizacion({ ...formCitaServioActualizacion, tiempo: e.target.value })}
                ></Input>
              </Col>
            </>
          ) : null}
          {colummEdit == "tiempo" ? (
            <>
              <Label style={{ marginRight: "4px", fontSize: "1.2rem" }}>Tiempo</Label>
              <Input
                style={{ fontSize: "1.2rem" }}
                value={formCitaServioActualizacion?.tiempo}
                onChange={(e) => setFormCitaServioActualizacion({ ...formCitaServioActualizacion, tiempo: e.target.value })}
              ></Input>
            </>
          ) : null}
          {/* <Input
            value={formCitaServioActualizacion?.tiempo}
            onChange={(e) => setFormCitaServioActualizacion({ ...formCitaServioActualizacion, tiempo: e.target.value })}
          ></Input> */}
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              color="success"
              onClick={() => {
                console.log(formCitaServioActualizacion);
                putDetalleCitasServiciosUpd7(
                  formCitaServioActualizacion.no_cliente,
                  idSuc, //SUCURSAL: 1 SUCURSAL: 2
                  formCitaServioActualizacion.id,
                  formCitaServioActualizacion.tiempo,
                  formCitaServioActualizacion.idEstilista,
                  1,
                  formCitaServioActualizacion.idServicio,
                  idUser,
                  formCitaServioActualizacion.cantidad,
                  formCitaServioActualizacion.importe / formCitaServioActualizacion.cantidad,
                  formCitaServioActualizacion.hora_cita,
                  formCitaServioActualizacion.estatusCita
                );
              }}
            >
              Guardar
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={ModalCitaEditEstilistaVenta} onClose={() => setModalCitaEditEstilistaVenta(false)} size={"sm"}>
        <Box sx={styleCantidad}>
          {colummEdit == "d_stilista" ? (
            <>
              <Label for="atiende" style={{ marginRight: "0px" }}>
                Atiende:
              </Label>
              <Input
                bsSize="sm"
                type="select"
                name="atiende"
                id="atiende"
                value={formCitaServioActualizacion?.idEstilista}
                onChange={(e) => setFormCitaServioActualizacion({ ...formCitaServioActualizacion, idEstilista: e.target.value })}
                style={{ fontSize: "0.8rem" }}
              >
                <option value="0">Seleccione un estilista</option>
                {dataEstilistas.map((opcion, index) => (
                  <option value={opcion.id} key={index}>
                    {opcion.estilista}
                  </option>
                ))}
              </Input>
            </>
          ) : null}

          {colummEdit == "stao_estilista" ? (
            <>
              <Input value={formCitaServioActualizacion?.estatusCita == 2 ? "Requerido" : "Asignado"}></Input>
              <Button
                color="success"
                onClick={() =>
                  setFormCitaServioActualizacion({
                    ...formCitaServioActualizacion,
                    estatusCita: formCitaServioActualizacion.estatusCita == 2 ? 3 : 2,
                  })
                }
              >
                Cambio
              </Button>
            </>
          ) : null}
          {colummEdit == "hora_cita" ? (
            <>
              <Label>Hora inicio</Label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  timeSteps={{ minutes: 15 }}
                  slotProps={{ textField: { size: "small" } }}
                  value={formCitaServioActualizacion?.hora_cita ? new Date(decodeURIComponent(formCitaServioActualizacion?.hora_cita)) : null}
                  // value={formCitaServioActualizacion?.hora_cita ? new Date(formCita.fecha).toTimeString().substring(0, 5) : null}
                  onChange={(hora) => handleChangeFechaEdicionServicio("hora", hora)}
                  sx={{
                    "& .MuiInputBase-input": {
                      width: "128px",
                    },
                    "& .MuiPickersDay-dayWithMargin": {
                      // Oculta el ícono del DatePicker
                      display: "none",
                    },
                    "& .MuiSvgIcon-root": {
                      // Aquí se oculta el ícono
                      width: "0.8rem",
                      backgroundColor: "#ffccac",
                    },
                  }}
                  renderInput={(props) => (
                    <Input
                      {...props}
                      size="small"
                      style={{
                        fontSize: "0.8rem",
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </>
          ) : null}
          {colummEdit == "horafinal" ? (
            <>
              <Label>Hora final</Label>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  timeSteps={{ minutes: 15 }}
                  slotProps={{ textField: { size: "small" } }}
                  value={formCitaServioActualizacion?.horafinal ? new Date(decodeURIComponent(formCitaServioActualizacion?.horafinal)) : null}
                  // value={formCitaServioActualizacion?.hora_cita ? new Date(formCita.fecha).toTimeString().substring(0, 5) : null}
                  onChange={(hora) => handleChangeFechaEdicionServicio("hora", hora)}
                  sx={{
                    "& .MuiInputBase-input": {
                      width: "128px",
                    },
                    "& .MuiPickersDay-dayWithMargin": {
                      // Oculta el ícono del DatePicker
                      display: "none",
                    },
                    "& .MuiSvgIcon-root": {
                      // Aquí se oculta el ícono
                      width: "0.8rem",
                      backgroundColor: "#ffccac",
                    },
                  }}
                  renderInput={(props) => (
                    <Input
                      {...props}
                      size="small"
                      style={{
                        fontSize: "0.8rem",
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </>
          ) : null}
          {colummEdit == "descripcion" ? (
            <>
              <Input value={formCitaServioActualizacion?.descripcion}></Input>
              <Button onClick={() => setProductosModalEdicionServicios(true)}>Cambio</Button>
              <Label>Tiempo Venta</Label>
              <Input
                value={formCitaServioActualizacion?.tiempo}
                onChange={(e) => setFormCitaServioActualizacion({ ...formCitaServioActualizacion, tiempo: e.target.value })}
              ></Input>
            </>
          ) : null}
          {colummEdit == "tiempo" ? (
            <>
              <Label>Tiempo Venta</Label>
              <Input
                value={formCitaServioActualizacion?.tiempo}
                onChange={(e) => setFormCitaServioActualizacion({ ...formCitaServioActualizacion, tiempo: e.target.value })}
              ></Input>
            </>
          ) : null}
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              color="success"
              onClick={() => {
                console.log(formCitaServioActualizacion);
                putVentaAgenda(
                  formCitaServioActualizacion.idVenta,
                  formCitaServioActualizacion.hora_cita,
                  formCitaServioActualizacion.horafinal,
                  formCitaServioActualizacion.idEstilista,
                  formCitaServioActualizacion.tiempo
                );
              }}
            >
              Guardar
            </Button>
          </div>
        </Box>
      </Modal>

      <Modal open={ModalCantidad} onClose={() => setModalCantidad(false)} size={"sm"} disableAutoFocus disableEnforceFocus>
        <Box sx={{ ...styleCantidad, backgroundColor: "white" }}>
          <Typography variant="h5">Agregue la cantidad</Typography>
          <Input
            type="text"
            name="minutos"
            id="minutos"
            value={formCitaServicio.cantidad}
            onChange={(v) => {
              setFormCitaServicio({ ...formCitaServicio, cantidad: v.target.value });
            }}
          />
          <br />

          <br />
          <Button
            style={{ marginRight: "5px" }}
            onClick={() => {
              setModalCantidad(false);

              setVentaTemporal((prevVentaTemporal) => {
                const newId = prevVentaTemporal.length > 0 ? prevVentaTemporal[prevVentaTemporal.length - 1].id + 1 : 0;
                const newVentaTemporal = [
                  ...prevVentaTemporal,
                  {
                    id: newId,
                    clave: dataVentaTemporal.clave,
                    clave_prod: dataVentaTemporal.clave_prod,
                    descripcion: dataVentaTemporal.descripcion,
                    precio: dataVentaTemporal.precio,
                    tiempo: dataVentaTemporal.tiempo,
                    cantidad: formCitaServicio.cantidad ? formCitaServicio.cantidad : 1,
                  },
                ];
                return newVentaTemporal;
              });
              setDataVentaTemporal({});
            }}
          >
            Guardar
          </Button>
          <Button
            color="danger"
            onClick={() => {
              setModalCantidad(false);
              setDataVentaTemporal({});
            }}
          >
            Cancelar
          </Button>
        </Box>
      </Modal>
      <Modal open={modalPromociones} onClose={() => setModalPromociones(false)} disableAutoFocus disableEnforceFocus>
        <Box sx={{ ...styleAltaServicio }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h3>Promociones</h3>
            <Button color="primary" onClick={() => setModalPrepagos(true)}>
              Prepagos
            </Button>
          </div>
          <MaterialReactTable
            columns={columnsPromo}
            data={dataPromocionesZonas.filter((promocion) => new Date(promocion.f2) >= new Date())}
            initialState={{ density: "compact" }}
            muiTableBodyProps={{ sx: { fontSize: "16px" } }}
            muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
            muiTableBodyCellProps={{
              sx: {
                fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
              },
            }}
          />
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button color="danger" onClick={() => setModalPromociones(false)}>
              Salir
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={modalPrepagos} onClose={() => setModalPrepagos(false)} disableAutoFocus disableEnforceFocus>
        <Box sx={{ ...styleAltaServicio }}>
          <h3>Prepagos</h3>
          <br />
          <h5>Seleccione el prepago</h5>
          <Input
            onChange={(e) => {
              setClavePrepago(e.target.value);
              // setFormCitaServicio({ ...formCitaServicio, clave_prepago: e.target.value });
            }}
            type="select"
            defaultValue={"Seleccione el prepago"}
          >
            <option value="Seleccione el prepago">Seleccione el prepago</option>
            {dataPrepagos
              .reduce((acc, item) => {
                if (!acc.includes(item.clave_prepago)) {
                  acc.push(item.clave_prepago);
                }
                return acc;
              }, [])
              .map((clave) => (
                <option key={clave} value={clave}>
                  {dataPrepagos.find((item) => item.clave_prepago === clave).d_prepago}
                </option>
              ))}
          </Input>
          <br />
          <MaterialReactTable
            columns={columnsPrepagos}
            data={dataPrepagos.filter((item) => Number(item.clave_prepago) === Number(clavePrepago))}
            initialState={{ density: "compact" }}
            muiTableBodyProps={{ sx: { fontSize: "16px" } }}
            muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
            getRowId={(row) => row.clave_prepago}
            muiTableBodyCellProps={{
              sx: {
                fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
              },
            }}
          />
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button color="danger" onClick={() => setModalPrepagos(false)}>
              Salir
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={modalPromocionesFechas} onClose={() => setModalPromocionesFechas(false)} disableAutoFocus disableEnforceFocus>
        <Box sx={{ ...styleAltaServicio }}>
          <h3>Fechas de la promoción: </h3>
          <MaterialReactTable
            columns={columnsPromoDias}
            data={dataPromocionesZonas.length > 0 ? dataPromocionesZonas.filter((item) => item.id == formPromocion.id) : []}
            initialState={{ density: "compact" }}
            muiTableBodyProps={{ sx: { fontSize: "16px" } }}
            muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
            muiTableBodyCellProps={{
              sx: {
                fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
              },
            }}
          />
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button color="danger" onClick={() => setModalPromocionesFechas(false)}>
              Salir
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={modalPromocionesGrupos} onClose={() => setModalPromocionesGrupos(false)} disableAutoFocus disableEnforceFocus>
        <Box sx={{ ...styleAltaServicio }}>
          <h3>Promociones Grupos</h3>
          <Table>
            <thead>
              <tr>
                <th>Selector</th>
                <th>Área</th>
                <th>Depto</th>
                <th>Subdepto</th>
                <th>Producto</th>
                <th>%</th>
                <th>Precio</th>
              </tr>
            </thead>

            <tbody>
              {dataPromocionesGrupos.map((dato) => (
                <tr key={dato.id}>
                  <td>
                    {" "}
                    <Button
                      disabled={dato.d_producto != "Todos"}
                      onClick={() => {
                        setDataProductosAreaDeptoSub([]);
                        fetchProductosAreaDeptoSub(0, 0, 1, "1", "%", "%", 2, 2, 2, 0, dato.idArea, dato.idDepto, dato.idSubdepto);
                        setproductosModalGrupos(true);
                      }}
                    >
                      Prod del grupo
                    </Button>
                  </td>
                  <td> {dato.d_area}</td>
                  <td>{dato.d_depto}</td>
                  <td>{dato.d_subdepto}</td>
                  <td>{dato.d_producto}</td>
                  <td>{Math.trunc(dato.descuentoPorcentaje * 100)} %</td>
                  <td>{dato.precioFijo}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button color="danger" onClick={() => setModalPromocionesGrupos(false)}>
              Salir
            </Button>
          </div>
        </Box>
      </Modal>

      <Modal open={modalCumpleanios} onClose={() => setModalCumpleanios(false)} disableAutoFocus disableEnforceFocus>
        <Box sx={{ ...styleAltaServicio }}>
          <h3>Cumpleaños del mes</h3>
          <MaterialReactTable
            columns={columnsCumple}
            data={dataCumpleañosProximos}
            enableRowSelection={false}
            enableRowExport={false}
            muiTableBodyProps={{ sx: { fontSize: "16px" } }}
            muiTableHeadCellProps={{ sx: { fontSize: "16px" } }}
            muiTableBodyCellProps={{
              sx: {
                fontSize: "16px", // Cambia el tamaño de la fuente de las celdas del cuerpo aquí
              },
            }}
            enablePagination
            options={{
              pageSize: 5, // Muestra solo 10 renglones
            }}
            initialState={{
              density: "compact",
              showGlobalFilter: false,
              pagination: {
                pageSize: 5,
                pageIndex: 0,
              },
            }}
          />
          <br />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button color="danger" onClick={() => setModalCumpleanios(false)}>
              Salir
            </Button>
          </div>
        </Box>
      </Modal>

      <Draggable>
        <Modal
          keepMounted
          open={ModalCrear}
          style={{ maxWidth: "48%", maxHeight: "95%", overflow: "auto" }}
          onClose={() => setModalCrear(false)}
          disableEnforceFocus
        >
          <Box sx={styleCrearCita}>
            <div
              onClick={() => setModalCrear(false)}
              style={{
                cursor: "pointer",
                marginRight: "2px",
                marginTop: "2px",
                width: "20px",
                height: "20px",
                backgroundColor: "red",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute", // Agrega esta línea
                top: "10px", // Agrega esta línea
                right: "10px", // Agrega esta línea
                borderRadius: "50%",
                // si requiero ponerlo en la derecha
              }}
            >
              X
            </div>
            <div style={{ flex: 1, justifyContent: "space-between", alignContent: "right", alignItems: "right", display: "flex" }}>
              <h1>Creación de cita</h1>
              <div>
                <Button
                  size="sm"
                  disabled={!formCitaDescripciones.descripcion_no_cliente}
                  onClick={() => {
                    if (dataClientesPuntos.length == 0) {
                      Swal.fire({
                        icon: "error",
                        title: "Sin puntos",
                        text: `Este cliente todavia no cuenta con puntos`,
                        confirmButtonColor: "#3085d6", // Cambiar el color del botón OK
                      });
                    } else {
                      setModalClientesPuntos(true);
                    }
                  }}
                >
                  Historial puntos
                </Button>
                <Button
                  size="sm"
                  disabled={!formCitaDescripciones.descripcion_no_cliente}
                  color={"primary"}
                  onClick={() => {
                    setModalVentasHistorial(true);
                  }}
                >
                  Historial ventas
                </Button>
              </div>
            </div>
            <div>
              <Row form>
                <Col xs="12" style={{ marginBottom: 0 }}>
                  <FormGroup style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                    <Label for="cliente" style={{ width: 125, fontSize: "1.1rem" }}>
                      Cliente:
                    </Label>
                    <InputGroup size="sm" style={{ flexGrow: 1, alignItems: "center", marginBottom: "0px" }}>
                      <Input
                        disabled
                        value={formCitaDescripciones.descripcion_no_cliente}
                        type="text"
                        name="cliente"
                        id="cliente"
                        style={{ fontSize: "1.1rem" }}
                      />
                      <Button size="sm" onClick={() => setClientesModal(true)} style={{ fontSize: "1.1rem" }}>
                        Buscar
                      </Button>
                    </InputGroup>
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <InputGroup size="sm" style={{ flexGrow: 1, alignItems: "center", marginBottom: "0px" }}>
                    <Label for="cliente" style={{ width: 105, fontSize: "1.1rem" }}>
                      Observacion:
                    </Label>

                    <Input
                      // onChange={(event) => {
                      //   setFormCita((prev) => ({ ...prev, observacion: event.target.value }));
                      // }}
                      onChange={handleChangeObservaciones}
                      type="text"
                      name="observacion"
                      id="observacion"
                      style={{ fontSize: "1.1rem" }}
                    />
                  </InputGroup>
                </Col>
                <Col xs="6" style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                  <FormGroup style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                    <InputGroup size="sm" style={{ flexGrow: 1, alignItems: "center", marginBottom: "0px" }}>
                      <Label for="cliente" style={{ width: 55, fontSize: "1.1rem" }}>
                        Ptos:
                      </Label>
                      <Input
                        bsSize="sm"
                        disabled
                        value={dataPuntosporCliente[0]?.puntosTotal || 0}
                        type="text"
                        name="puntos"
                        id="puntos"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </InputGroup>
                  </FormGroup>
                </Col>

                <Col xs="6">
                  <FormGroup style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                    <InputGroup size="sm" style={{ flexGrow: 1, alignItems: "center", marginBottom: "0px" }}>
                      <Label style={{ width: 105, fontSize: "1.1rem" }}>Clasificacion</Label>
                      <Input
                        disabled
                        value={dataClasificacion[0]?.descripcion ? dataClasificacion[0]?.descripcion : 0}
                        type="text"
                        name="clasificacion"
                        id="clasificacion"
                        style={{ fontSize: "1.1rem" }}
                      />
                    </InputGroup>
                  </FormGroup>
                </Col>

                <Col xs="6">
                  <FormGroup check style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                    <Label check>
                      <Input
                        name="esServicioDomicilio"
                        type="checkbox"
                        checked={formCita.esServicioDomicilio}
                        onChange={handleCheckboxChangeDomicilio}
                        disabled={formCitaServicio.idCita}
                      />
                      <strong style={{ fontSize: "1.1rem" }}>Servicio a domicilio</strong>
                    </Label>
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                    <Label for="fecha" style={{ width: 105, fontSize: "1.1rem" }}>
                      Fecha:
                    </Label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        disabled={formCitaServicio.idCita}
                        openPickerIcon={<Box />} // Aquí se elimina el ícono
                        slotProps={{ textField: { size: "small" } }}
                        style={{ height: 20 }}
                        value={datosParametros.fecha ? new Date(datosParametros.fecha) : null}
                        onChange={(fecha) => handleChangeFecha("fecha", fecha)}
                        format="dd/MM/yyyy"
                        sx={{
                          "& .MuiInputBase-input": {
                            width: "128px",
                          },
                          "& .MuiPickersDay-dayWithMargin": {
                            // Oculta el ícono del DatePicker
                            display: "none",
                          },
                          "& .MuiSvgIcon-root": {
                            // Aquí se oculta el ícono
                            width: "0.8rem",
                            backgroundColor: "transparent",
                          },
                          "& .MuiIconButton-root": {
                            marginRight: "-16px",
                          },
                        }}
                        renderInput={(props) => (
                          <TextField
                            {...props}
                            size="small"
                            InputProps={{ endAdornment: null }} // Aquí se elimina el ícono
                            sx={{
                              fontSize: "1.1rem",
                              "& .MuiInputBase-input": {
                                height: "30px", // Ajusta la altura aquí
                                padding: "0 14px", // Ajusta el padding para centrar el texto
                              },
                              "& .MuiOutlinedInput-root": {
                                height: "30px", // Ajusta la altura aquí
                                padding: "0px", // Remueve el padding interno
                              },
                              "& .MuiOutlinedInput-input": {
                                height: "30px", // Ajusta la altura aquí
                                display: "flex",
                                alignItems: "center",
                              },
                              "& .MuiInputAdornment-root": {
                                height: "30px", // Asegura que los adornos tengan la misma altura
                                "& button": {
                                  height: "30px", // Ajusta la altura del botón del ícono
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <FormGroup style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                    <Label for="cliente" style={{ width: 55, fontSize: "1.1rem" }}>
                      Hora:
                    </Label>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        disabled={formCitaServicio.idCita}
                        timeSteps={{ minutes: 15 }}
                        slotProps={{ textField: { size: "small" } }}
                        value={formCita.fecha ? new Date(decodeURIComponent(formCita.fecha)) : null}
                        // value={formCita.fecha ? new Date(formCita.fecha).toTimeString().substring(0, 5) : null}
                        onChange={(hora) => handleChangeFecha("hora", hora)}
                        sx={{
                          "& .MuiInputBase-input": {
                            width: "128px",
                          },
                          "& .MuiPickersDay-dayWithMargin": {
                            // Oculta el ícono del DatePicker
                            display: "none",
                          },
                          "& .MuiSvgIcon-root": {
                            // Aquí se oculta el ícono
                            width: "0.8rem",
                          },
                        }}
                        renderInput={(props) => (
                          <Input
                            {...props}
                            size="small"
                            style={{
                              fontSize: "1.1rem",
                            }}
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </FormGroup>
                </Col>
                <Col xs="6">
                  <InputGroup size="sm" style={{ flexGrow: 1, alignItems: "center", marginBottom: "0px" }}>
                    <Label for="atiende" style={{ width: 105, fontSize: "1.1rem" }}>
                      Atiende:
                    </Label>
                    <Input
                      disabled={formCitaServicio.idCita}
                      bsSize="sm"
                      type="select"
                      name="atiende"
                      id="atiende"
                      value={formCita.no_estilista}
                      onChange={(e) => setFormCita({ ...formCita, no_estilista: e.target.value })}
                      style={{ fontSize: "1.1rem" }}
                    >
                      <option value={0}>Seleccione un estilista</option>
                      {dataEstilistas.map((opcion, index) => (
                        <option value={opcion.id} key={index}>
                          {opcion.estilista}
                        </option>
                      ))}
                    </Input>
                  </InputGroup>
                </Col>
                <Col xs="6">
                  <FormGroup style={{ display: "flex", alignItems: "center", marginBottom: "0px" }}>
                    <FormGroup check>
                      <Label check style={{ fontSize: "1.1rem", marginRight: "5px" }}>
                        <Input
                          name="estatus"
                          type="checkbox"
                          checked={formCita.estatusRequerido}
                          onChange={() => handleCheckboxChange("estatusRequerido")}
                        />{" "}
                        <strong>Requerido</strong>
                      </Label>
                    </FormGroup>
                    <FormGroup check>
                      <Label check style={{ fontSize: "1.1rem" }}>
                        <Input
                          name="estatus"
                          type="checkbox"
                          checked={formCita.estatusAsignado}
                          onChange={() => handleCheckboxChange("estatusAsignado")}
                        />{" "}
                        <strong>Asignado</strong>
                      </Label>
                    </FormGroup>
                  </FormGroup>
                </Col>
              </Row>
            </div>
            <hr />
            <Box marginLeft={0} marginRight={0} gap={2} alignItems={"center"} justifyContent={"center"}>
              <Button
                color={"success"}
                onClick={() => {
                  postCrearCita();
                }}
                variant="contained"
              >
                Ingresar servicios...
              </Button>
              <ThemeProvider theme={theme}>
                <DataGrid
                  autoHeight
                  slots={{ noRowsOverlay: CustomNoRowsOverlay }}
                  sx={{ "--DataGrid-overlayHeight": "250px" }}
                  rows={dataCitasServicios}
                  columns={columnsCitasServicios}
                />
              </ThemeProvider>

              <Box marginLeft={0} marginRight={0} marginTop={1} gap={1} display="flex" justifyContent={"center"} alignItems={"center"}>
                <Col style={{ border: "1px solid black", padding: "10px", margin: "10px", width: "300px", textAlign: "center", fontWeight: "bold" }}>
                  <Label>Clave de reservación</Label>
                  {/* <Input value={"100-2-75"}> </Input> */}
                  <Input value={formCitaServicio.idCita ? formCitaServicio.idCita + "-" + 1 + "-" + format(new Date(formCita.fecha), "ddM") : ""}>
                    {" "}
                  </Input>
                </Col>
                <Col>
                  <FormGroup>
                    <Label for="total2">Total</Label>
                    <Input type="text" name="total2" id="total2" placeholder={"$" + formVentaTemporal.precioTotal.toFixed(2)} disabled />
                  </FormGroup>

                  <FormGroup>
                    <Label for="otros">Otros</Label>
                    <Input type="text" name="otros" id="otros" disabled placeholder={formVentaTemporal.otros} />
                  </FormGroup>
                  <FormGroup>
                    <Label for="total">Total</Label>
                    <Input type="text" name="total" id="total" placeholder={"$" + formVentaTemporal.precioTotalyOtros.toFixed(2)} disabled />
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup>
                    <Label for="minutos">Minutos</Label>
                    <Input type="text" name="minutos" id="minutos" placeholder={formVentaTemporal.tiempo + " Min"} disabled />
                  </FormGroup>

                  <FormGroup>
                    <Label for="horas">Horas</Label>
                    <Input type="text" name="horas" id="horas" placeholder={convertirMinutosAHorasYMinutos(formVentaTemporal.tiempo)} disabled />
                  </FormGroup>

                  <ButtonGroup style={{ marginBottom: "10%" }}>
                    <Button
                      color="primary"
                      block
                      onClick={() => {
                        putCitasServiciosTerminado();
                      }}
                      // disabled={!agregarServicios}
                    >
                      Guardar
                    </Button>
                    <Button color="danger" block onClick={() => window.close()}>
                      Salir
                    </Button>
                  </ButtonGroup>
                </Col>
              </Box>
            </Box>
          </Box>
        </Modal>
      </Draggable>
    </>
  );
}
const StyledGridOverlay = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  "& .ant-empty-img-1": {
    fill: theme.palette.mode === "light" ? "#aeb8c2" : "#262626",
  },
  "& .ant-empty-img-2": {
    fill: theme.palette.mode === "light" ? "#f5f5f7" : "#595959",
  },
  "& .ant-empty-img-3": {
    fill: theme.palette.mode === "light" ? "#dce0e6" : "#434343",
  },
  "& .ant-empty-img-4": {
    fill: theme.palette.mode === "light" ? "#fff" : "#1c1c1c",
  },
  "& .ant-empty-img-5": {
    fillOpacity: theme.palette.mode === "light" ? "0.8" : "0.08",
    fill: theme.palette.mode === "light" ? "#f5f5f5" : "#fff",
  },
}));

function CustomNoRowsOverlay() {
  return (
    <StyledGridOverlay>
      <svg style={{ flexShrink: 0 }} width="240" height="200" viewBox="0 0 184 152" aria-hidden focusable="false">
        <g fill="none" fillRule="evenodd">
          <g transform="translate(24 31.67)">
            <ellipse className="ant-empty-img-5" cx="67.797" cy="106.89" rx="67.797" ry="12.668" />
            <path
              className="ant-empty-img-1"
              d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
            />
            <path className="ant-empty-img-2" d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" />
            <path
              className="ant-empty-img-3"
              d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
            />
          </g>
          <path
            className="ant-empty-img-3"
            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
          />
          <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
            <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
          </g>
        </g>
      </svg>
      <Box sx={{ mt: 1 }}>No Rows</Box>
    </StyledGridOverlay>
  );
}
export default wrapperFun(Basic);
