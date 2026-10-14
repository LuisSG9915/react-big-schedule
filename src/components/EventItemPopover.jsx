import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "antd";
import { peinadosApi } from "../api/peinadosApi";
import { useObservaciones } from "../functions/crearCita/useObservaciones";
import { AiFillEye } from "react-icons/ai";

function EventItemPopover({
  schedulerData,
  eventItem,
  title,
  startTime,
  endTime,
  statusColor,
  subtitleGetter,
  viewEventClick,
  viewEventText,
  viewEvent2Click,
  viewEvent2Text,
  eventItemPopoverTemplateResolver,
}) {
  const { localeDayjs, config } = schedulerData;
  

  // Manejar tanto objetos Date como strings
  const startDate = startTime instanceof Date ? startTime : new Date(startTime);
  const endDate = endTime instanceof Date ? endTime : new Date(endTime);
  

  // Crear objetos dayjs
  const start = localeDayjs(startDate);
  const end = localeDayjs(endDate);

  // Detectar si la cita supera la hora de salida de la sucursal
  const finRealDate = eventItem?.finReal
    ? eventItem.finReal instanceof Date
      ? eventItem.finReal
      : new Date(eventItem.finReal)
    : null;
  const finReal = finRealDate ? localeDayjs(finRealDate) : null;
  const superaSalida =
    eventItem?.superaHoraSalida ||
    (finRealDate && finRealDate.getTime() > endDate.getTime());

  const minutosReales = eventItem?.tiempoReal || eventItem?.tiempo;
  let tiempoRealTexto = "";
  if (minutosReales) {
    const horas = Math.floor(minutosReales / 60);
    const mins = minutosReales % 60;
    tiempoRealTexto =
      horas > 0
        ? mins > 0
          ? `${horas}h ${mins}m (${minutosReales} min)`
          : `${horas}h (${minutosReales} min)`
        : `${minutosReales} min`;
  }

  if (eventItemPopoverTemplateResolver) {
    return eventItemPopoverTemplateResolver(schedulerData, eventItem, title, start, end, statusColor);
  }

  const subtitle = subtitleGetter ? subtitleGetter(schedulerData, eventItem) : null;
  const showViewEvent = viewEventText && viewEventClick && (eventItem.clickable1 === undefined || eventItem.clickable1);
  const showViewEvent2 = viewEvent2Text && viewEvent2Click && (eventItem.clickable2 === undefined || eventItem.clickable2);

  const renderViewEvent = (text, clickHandler, marginLeft = 0) => (
    <button
      className="header2-text txt-btn-dis"
      type="button"
      style={{ color: "#108EE9", cursor: "pointer", marginLeft: `${marginLeft}px` }}
      onClick={() => clickHandler(schedulerData, eventItem)}
    >
      {text}
    </button>
  );
  const [dataPuntosporCliente, setDataPuntosPorCliente] = useState({});
  const { dataObservaciones, fetchObservaciones } = useObservaciones({ idCliente: eventItem.no_cliente });

  // https://cbinfo.no-ip.info:9018/sp_detalleCitasServiciosResumen_Result?idCita=2087
  const getEstilistas = () => {
    peinadosApi
      .get(
        `/sp_detalleCitasServiciosResumen5?idCita=${eventItem.idCita}&cve_cliente=${eventItem.no_cliente}&estilista=${eventItem.no_estilista}&idVenta=${eventItem.noVenta || 0}`
      )
      .then((response) => {
        setDataPuntosPorCliente(response.data[0]);
      });
  };
  useEffect(() => {
    getEstilistas();
  }, []);

  return (
    <div style={{ width: config.eventItemPopoverWidth }}>
      <Row type="flex" align="middle">
        {config.eventItemPopoverShowColor && (
          <Row justify="space-between" style={{ width: "100%" }}>
            <div className="status-dot" style={{ backgroundColor: statusColor }} />
            <div>
              <AiFillEye size={23} onClick={() => window.open("http://217.216.95.62:9020/CatClientes", "_blank")} />
            </div>
          </Row>
        )}
        <Col span={22} className="overflow-text">
          <span className="header2-text" title={title}>
            {title}
          </span>
        </Col>
      </Row>
      {subtitle && (
        <Row type="flex" align="middle">
          <Col span={2}>
            <div />
          </Col>
          <Col span={22} className="overflow-text">
            <span className="header2-text" title={subtitle}>
              {subtitle}
            </span>
          </Col>
        </Row>
      )}
      <Row type="flex" align="middle">
        <Col span={2}>
          <div />
        </Col>
        <Col span={22}>
          <span className="header1-text">{start.format("HH:mm")}</span>
          {config.eventItemPopoverDateFormat && (
            <span className="help-text" style={{ marginLeft: "8px" }}>
              {start.format(config.eventItemPopoverDateFormat)}
            </span>
          )}
          <span className="header2-text" style={{ marginLeft: "8px" }}>
            -
          </span>
          <span className="header1-text" style={{ marginLeft: "8px" }}>
            {end.format("HH:mm")}
          </span>
          {config.eventItemPopoverDateFormat && (
            <span className="help-text" style={{ marginLeft: "8px" }}>
              {end.format(config.eventItemPopoverDateFormat)}
            </span>
          )}
        </Col>
      </Row>
      {superaSalida && (
        <Row type="flex" align="middle" style={{ marginTop: "6px", marginBottom: "6px" }}>
          <Col span={2}>
            <div />
          </Col>
          <Col span={22}>
            <div
              style={{
                backgroundColor: "#fff7e6",
                border: "1px solid #ffd591",
                borderRadius: "6px",
                padding: "6px 10px",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              <div
                style={{
                  color: "#d46b08",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginBottom: "2px",
                }}
              >
                <span>⚠️</span>
                <span>Supera horario de salida</span>
              </div>
              {finReal && (
                <div style={{ color: "#434343" }}>
                  <strong>Fin real:</strong>{" "}
                  <span style={{ color: "#1890ff", fontWeight: "600" }}>
                    {finReal.format("HH:mm")}{" "}
                    {config.eventItemPopoverDateFormat && (
                      <span style={{ fontSize: "11px", fontWeight: "normal", color: "#8c8c8c" }}>
                        ({finReal.format(config.eventItemPopoverDateFormat)})
                      </span>
                    )}
                  </span>
                </div>
              )}
              {tiempoRealTexto && (
                <div style={{ color: "#434343" }}>
                  <strong>Tiempo real:</strong>{" "}
                  <span style={{ fontWeight: "600", color: "#262626" }}>{tiempoRealTexto}</span>
                </div>
              )}
            </div>
          </Col>
        </Row>
      )}
      {(showViewEvent || showViewEvent2) && (
        <Row type="flex" align="middle">
          <Col span={2}>
            <div />
          </Col>
          <Col>
            <p className="header2-text">Cliente: {dataPuntosporCliente?.nombre}</p>
            <p className="header2-text">Servicios: {dataPuntosporCliente?.descripcion}</p>
            <p className="header2-text">Observaciones de la cita: {dataPuntosporCliente?.observaciones}</p>
          </Col>
          <Col span={22}>
            {showViewEvent && renderViewEvent(viewEventText, viewEventClick)}
            {showViewEvent2 && renderViewEvent(viewEvent2Text, viewEvent2Click, 16)}
          </Col>
        </Row>
      )}
    </div>
  );
}

EventItemPopover.propTypes = {
  schedulerData: PropTypes.object.isRequired,
  eventItem: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  statusColor: PropTypes.string.isRequired,
  subtitleGetter: PropTypes.func,
  viewEventClick: PropTypes.func,
  viewEventText: PropTypes.string,
  viewEvent2Click: PropTypes.func,
  viewEvent2Text: PropTypes.string,
  eventItemPopoverTemplateResolver: PropTypes.func,
};

export default EventItemPopover;
