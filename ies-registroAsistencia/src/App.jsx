import { useState } from "react";

import Inicio from "./pages/inicio";
import Login from "./pages/Login";
import Seleccion from "./pages/Seleccion";
import Asistencia from "./pages/Asistencia";
import { obtenerAsistenciasAPI } from "./services/asistenciaService";
import { obtenerMateria } from "./services/materiaService";

const datosIniciales = {
  id_usuario: null,
  usuario: "",
  nombre: "",
  rol: "",
  id_materia: null,
  materia: "",
  dia: "",
  id_asistencia: null,
};

function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [datosUsuario, setDatosUsuario] = useState(datosIniciales);
  const [datosClase, setDatosClase] = useState(datosIniciales);

  // ======================================================
  // IR AL LOGIN
  // ======================================================

  const irALogin = () => {
    setPantalla("login");
  };

  // ======================================================
  // INICIAR SESIÓN
  // ======================================================

  const iniciarSesion = async (usuario) => {
    if (!usuario?.id) {
      alert("No se recibieron los datos del usuario.");
      return;
    }

    const datos = {
      id_usuario: usuario.id,
      usuario: usuario.usuario,
      nombre: usuario.nombre,
      rol: usuario.rol,
      id_materia: null,
      materia: "",
      dia: "",
      id_asistencia: null,
    };

    setDatosUsuario(datos);

    // ====================================================
    // NO DOCENTE
    // ====================================================

    if (usuario.rol === "no_docente") {
      setDatosClase(datos);
      setPantalla("asistencia");
      return;
    }

    // ====================================================
    // VALIDAR ROL
    // ====================================================

    if (usuario.rol !== "docente") {
      alert("El usuario no tiene un rol válido.");
      return;
    }

    // ====================================================
    // BUSCAR SI TIENE UNA ASISTENCIA ABIERTA
    // ====================================================

    try {
      const asistencias = await obtenerAsistenciasAPI(usuario.id);

      const abierta = asistencias.find(
        (asistencia) =>
          asistencia.fecha_hora_salida === null
      );

      if (abierta) {
        let nombreMateria = "";

        if (abierta.id_materia) {
          try {
            const materia = await obtenerMateria(
              abierta.id_materia
            );

            nombreMateria = materia.nombre_materia;
          } catch (error) {
            console.error(
              "No se pudo obtener la materia:",
              error
            );
          }
        }

        setDatosClase({
          ...datos,
          id_materia: abierta.id_materia,
          materia: nombreMateria,
          id_asistencia: abierta.id_asistencia,
        });

        setPantalla("asistencia");
        return;
      }
    } catch (error) {
      console.error(
        "No se pudo consultar la asistencia:",
        error
      );

      alert(
        "No se pudo consultar el estado de asistencia."
      );

      return;
    }

    // ====================================================
    // SI NO TIENE ASISTENCIA ABIERTA
    // MOSTRAR SELECCIÓN DE MATERIA
    // ====================================================

    setDatosClase(datos);
    setPantalla("seleccion");
  };

  // ======================================================
  // IR A ASISTENCIA
  // ======================================================

  const irAAsistencia = (datos) => {
    setDatosClase(datos);
    setPantalla("asistencia");
  };

  // ======================================================
  // VOLVER A SELECCIONAR MATERIA
  // ======================================================

  const volverASeleccionMaterias = () => {
    setPantalla("seleccion");
  };

  // ======================================================
  // VOLVER AL INICIO / CERRAR SESIÓN
  // ======================================================

  const volverAlInicio = () => {
    setDatosUsuario(datosIniciales);
    setDatosClase(datosIniciales);
    setPantalla("inicio");
  };

  // ======================================================
  // INTERFAZ
  // ======================================================

  return (
    <>
      {/* ==================================================
          INICIO
      ================================================== */}

      {pantalla === "inicio" && (
        <Inicio onIniciar={irALogin} />
      )}

      {/* ==================================================
          LOGIN
      ================================================== */}

      {pantalla === "login" && (
        <Login onLogin={iniciarSesion} />
      )}

      {/* ==================================================
          SELECCIÓN DE MATERIA
      ================================================== */}

      {pantalla === "seleccion" && (
        <Seleccion
          onContinuar={irAAsistencia}
          nombre={datosUsuario.nombre}
          id_usuario={datosUsuario.id_usuario}
        />
      )}

      {/* ==================================================
          ASISTENCIA
      ================================================== */}

      {pantalla === "asistencia" && (
        <Asistencia
          datosClase={datosClase}
          onVolverLogin={volverAlInicio}

          // ----------------------------------------------
          // SOLO LOS DOCENTES PUEDEN VOLVER A SELECCIONAR
          // OTRA MATERIA
          // ----------------------------------------------

          onVolverMaterias={
            datosUsuario.rol === "docente"
              ? volverASeleccionMaterias
              : null
          }
        />
      )}
    </>
  );
}

export default App;