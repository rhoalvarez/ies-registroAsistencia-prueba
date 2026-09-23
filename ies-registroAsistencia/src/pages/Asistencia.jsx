import { useEffect, useState } from "react";

import {
  obtenerAsistenciasAPI,
  registrarEntradaAPI,
  registrarSalidaAPI,
} from "../services/asistenciaService";

import "../styles/Asistencia.css";

// ======================================================
// FORMATEAR HORA
// ======================================================

const formatearFechaHora = (fechaHora) => {
  if (!fechaHora) return "";

  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return "";
  }

  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

// ======================================================
// SABER SI UNA FECHA ES DE HOY
// ======================================================

const esDeHoy = (fechaHora) => {
  if (!fechaHora) return false;

  const fecha = new Date(fechaHora);

  if (Number.isNaN(fecha.getTime())) {
    return false;
  }

  const hoy = new Date();

  return (
    fecha.getFullYear() === hoy.getFullYear() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getDate() === hoy.getDate()
  );
};

// ======================================================
// COMPONENTE
// ======================================================

function Asistencia({
  datosClase,
  onVolverLogin,
  onVolverMaterias,
}) {
  const [ahora, setAhora] = useState(new Date());

  const [asistencia, setAsistencia] = useState(null);

  const [cargandoAsistencia, setCargandoAsistencia] =
    useState(true);

  const [cargando, setCargando] = useState(false);

  const [mensaje, setMensaje] = useState("");

  const [mostrarCuentaRegresiva, setMostrarCuentaRegresiva] =
    useState(false);

  const [segundosRestantes, setSegundosRestantes] =
    useState(5);

  // ======================================================
  // RELOJ
  // ======================================================

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAhora(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // ======================================================
  // BUSCAR ASISTENCIA DE HOY
  // ======================================================

  useEffect(() => {
    const cargarAsistencia = async () => {
      if (!datosClase.id_usuario) {
        setCargandoAsistencia(false);
        return;
      }

      try {
        setCargandoAsistencia(true);
        setMensaje("");

        const asistencias = await obtenerAsistenciasAPI(
          datosClase.id_usuario
        );

        // --------------------------------------------------
        // BUSCAMOS SOLAMENTE LA ASISTENCIA DE HOY
        // Y DE LA MATERIA SELECCIONADA
        // --------------------------------------------------

        const asistenciaHoy = asistencias.find((item) => {
          const mismaMateria =
            datosClase.rol === "docente"
              ? item.id_materia === datosClase.id_materia
              : item.id_materia === null;

          return (
            mismaMateria &&
            esDeHoy(item.fecha_hora_entrada)
          );
        });

        // --------------------------------------------------
        // SI EXISTE, LA MOSTRAMOS
        // TANTO SI ESTÁ ABIERTA COMO CERRADA
        // --------------------------------------------------

        if (asistenciaHoy) {
          setAsistencia(asistenciaHoy);

          if (asistenciaHoy.fecha_hora_salida) {
            setMensaje(
              "⚠️ Ya registraste la asistencia de hoy para esta materia."
            );
          }
        } else {
          setAsistencia(null);
        }
      } catch (error) {
        console.error(
          "Error al consultar asistencia:",
          error
        );

        setMensaje(
          "❌ No se pudo consultar la asistencia."
        );
      } finally {
        setCargandoAsistencia(false);
      }
    };

    cargarAsistencia();
  }, [
    datosClase.id_usuario,
    datosClase.id_materia,
    datosClase.rol,
  ]);

  // ======================================================
  // CUENTA REGRESIVA
  // ======================================================

  useEffect(() => {
    if (!mostrarCuentaRegresiva) {
      return;
    }

    setSegundosRestantes(5);

    const intervalo = setInterval(() => {
      setSegundosRestantes((segundos) => {
        if (segundos <= 1) {
          clearInterval(intervalo);

          onVolverLogin();

          return 0;
        }

        return segundos - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [
    mostrarCuentaRegresiva,
    onVolverLogin,
  ]);

  // ======================================================
  // REGISTRAR ENTRADA
  // ======================================================

  const registrarEntrada = async () => {
    // ----------------------------------------------------
    // SI YA EXISTE UNA ASISTENCIA DE HOY
    // NO PERMITIMOS REGISTRAR OTRA
    // ----------------------------------------------------

    if (asistencia) {
      if (asistencia.fecha_hora_salida) {
        setMensaje(
          "⚠️ Ya registraste la asistencia de hoy para esta materia."
        );
      } else {
        setMensaje(
          "⚠️ Ya existe una entrada abierta."
        );
      }

      return;
    }

    if (!datosClase.id_usuario) {
      setMensaje(
        "❌ No se encontró el usuario."
      );

      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const nuevaAsistencia =
        await registrarEntradaAPI(
          datosClase.id_usuario,

          datosClase.rol === "docente"
            ? datosClase.id_materia
            : null
        );

      setAsistencia(nuevaAsistencia);

      setMensaje(
        "✅ Entrada registrada correctamente."
      );
    } catch (error) {
      console.error(
        "Error al registrar entrada:",
        error
      );

      setMensaje(
        error.response?.data?.detail ||
          "❌ No se pudo registrar la entrada."
      );
    } finally {
      setCargando(false);
    }
  };

  // ======================================================
  // REGISTRAR SALIDA
  // ======================================================

  const registrarSalida = async () => {
    if (!asistencia) {
      setMensaje(
        "⚠️ Primero debe registrar la entrada."
      );

      return;
    }

    if (asistencia.fecha_hora_salida) {
      setMensaje(
        "⚠️ La salida ya fue registrada."
      );

      return;
    }

    try {
      setCargando(true);
      setMensaje("");

      const asistenciaActualizada =
        await registrarSalidaAPI(
          asistencia.id_asistencia
        );

      setAsistencia(asistenciaActualizada);

      setMensaje(
        datosClase.rol === "no_docente"
          ? "✅ Jornada finalizada correctamente."
          : "✅ Asistencia finalizada correctamente."
      );

      setMostrarCuentaRegresiva(true);
    } catch (error) {
      console.error(
        "Error al registrar salida:",
        error
      );

      setMensaje(
        error.response?.data?.detail ||
          "❌ No se pudo registrar la salida."
      );
    } finally {
      setCargando(false);
    }
  };

  // ======================================================
  // VOLVER A SELECCIONAR MATERIA
  // ======================================================

  const volverAMaterias = () => {
    if (mostrarCuentaRegresiva) {
      setMostrarCuentaRegresiva(false);
    }

    setMensaje("");

    if (onVolverMaterias) {
      onVolverMaterias();
    }
  };

  // ======================================================
  // DATOS PARA MOSTRAR
  // ======================================================

  const esNoDocente =
    datosClase.rol === "no_docente";

  const tieneEntrada =
    Boolean(asistencia?.fecha_hora_entrada);

  const tieneSalida =
    Boolean(asistencia?.fecha_hora_salida);

  // ======================================================
  // RELOJ ACTUAL
  // ======================================================

  const horaActual =
    ahora.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const fechaActual =
    ahora.toLocaleDateString("es-AR");

  // ======================================================
  // INTERFAZ
  // ======================================================

  return (
    <div className="asistencia-container">

      <div className="asistencia-card">

        <h1>
          Registro de Asistencia
        </h1>

        {/* ==============================================
            RELOJ
        ============================================== */}

        <div className="reloj">

          <strong>
            Hora actual
          </strong>

          <span>
            {horaActual}
          </span>

          <small>
            {fechaActual}
          </small>

        </div>

        {/* ==============================================
            DATOS DEL DOCENTE
        ============================================== */}

        <div className="datos-clase">

          <p>

            <strong>
              {esNoDocente
                ? "Empleado:"
                : "Profesor:"}
            </strong>

            {" "}

            {datosClase.nombre}

          </p>

          {!esNoDocente &&
            datosClase.materia && (

              <p>

                <strong>
                  Materia:
                </strong>

                {" "}

                {datosClase.materia}

              </p>

            )}

          {!esNoDocente &&
            datosClase.dia && (

              <p>

                <strong>
                  Día:
                </strong>

                {" "}

                {datosClase.dia}

              </p>

            )}

        </div>

        {/* ==============================================
            CARGANDO
        ============================================== */}

        {cargandoAsistencia && (

          <p>
            Consultando asistencia...
          </p>

        )}

        {/* ==============================================
            REGISTROS
        ============================================== */}

        <div className="registro">

          {/* ============================================
              ENTRADA
          ============================================ */}

          <div className="registro-item">

            <h2>
              Entrada
            </h2>

            <p>

              {formatearFechaHora(
                asistencia?.fecha_hora_entrada
              ) || "--:--:--"}

            </p>

            {/* ------------------------------------------
                TODAVÍA NO REGISTRÓ
            ------------------------------------------ */}

            {!tieneEntrada && (

              <>

                <button
                  type="button"
                  onClick={registrarEntrada}
                  disabled={
                    cargando ||
                    cargandoAsistencia
                  }
                >

                  {cargando
                    ? "Registrando..."
                    : "Registrar entrada"}

                </button>

                <p>
                  🟢 La entrada está disponible.
                </p>

              </>

            )}

            {/* ------------------------------------------
                YA REGISTRÓ ENTRADA
            ------------------------------------------ */}

            {tieneEntrada && (

              <p>
                ✅ Entrada registrada
              </p>

            )}

          </div>

          {/* ============================================
              SALIDA
          ============================================ */}

          <div className="registro-item">

            <h2>
              Salida
            </h2>

            <p>

              {formatearFechaHora(
                asistencia?.fecha_hora_salida
              ) || "--:--:--"}

            </p>

            {/* ------------------------------------------
                PUEDE REGISTRAR SALIDA
            ------------------------------------------ */}

            {tieneEntrada &&
              !tieneSalida && (

                <>

                  <button
                    type="button"
                    onClick={registrarSalida}
                    disabled={
                      cargando ||
                      cargandoAsistencia
                    }
                  >

                    {cargando
                      ? "Registrando..."
                      : "Registrar salida"}

                  </button>

                  <p>
                    🟢 Puede registrar su salida.
                  </p>

                </>

              )}

            {/* ------------------------------------------
                TODAVÍA NO ENTRÓ
            ------------------------------------------ */}

            {!tieneEntrada && (

              <p>
                🔒 Primero registre la entrada.
              </p>

            )}

            {/* ------------------------------------------
                SALIDA YA REGISTRADA
            ------------------------------------------ */}

            {tieneSalida && (

              <p>
                ✅ Salida registrada
              </p>

            )}

          </div>

        </div>

        {/* ==============================================
            MENSAJE
        ============================================== */}

        {mensaje && (

          <div className="mensaje-exito">

            <p>
              {mensaje}
            </p>

          </div>

        )}

        {/* ==============================================
            CUENTA REGRESIVA
        ============================================== */}

        {mostrarCuentaRegresiva && (

          <div>

            <p>

              Volviendo al inicio de sesión en{" "}

              <strong>
                {segundosRestantes}
              </strong>

              {" "}segundos...

            </p>

          </div>

        )}

        {/* ==============================================
            VOLVER A SELECCIONAR MATERIA
        ============================================== */}

        {!mostrarCuentaRegresiva && (
          <div
            style={{
              marginTop: "25px",
              textAlign: "center",
            }}
          >

            <button
              type="button"
              onClick={volverAMaterias}
              disabled={cargando}
            >
              ↩️ Volver a seleccionar materia
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default Asistencia;