import { useEffect, useState } from "react";

import { obtenerMateriasDeHoy } from "../services/docenteMateriaService";
import logoIES from "../assets/logo-ies.jpeg";
import "../styles/Seleccion.css";

function Seleccion({ onContinuar, nombre, id_usuario }) {
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarMaterias = async () => {
      if (!id_usuario) {
        setError("No se encontró el usuario.");
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError("");
        const respuesta = await obtenerMateriasDeHoy(id_usuario);
        setMaterias(respuesta);
      } catch (errorApi) {
        console.error("Error al obtener materias:", errorApi);
        setError("No se pudieron cargar las materias desde el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarMaterias();
  }, [id_usuario]);

  const handleContinuar = () => {
    if (!materiaSeleccionada) {
      alert("Seleccione una materia.");
      return;
    }

    onContinuar({
      id_usuario,
      nombre,
      rol: "docente",
      id_materia: materiaSeleccionada.id_materia,
      materia: materiaSeleccionada.nombre_materia,
      dia: materiaSeleccionada.dia_semana,
      id_asistencia: null,
    });
  };

  return (
    <div className="seleccion-container">
      <div className="seleccion-card">
        <img
          src={logoIES}
          alt="Logo del IES"
          className="seleccion-logo"
        />

        <div className="seleccion-header">
          <div className="icono-seleccion">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <path d="M3 10h18" />
              <path d="M8 14h2" />
              <path d="M14 14h2" />
              <path d="M8 18h2" />
              <path d="M14 18h2" />
            </svg>
          </div>

          <h1>Registro de Asistencia</h1>
          <p className="bienvenida">
            Bienvenido/a <strong>{nombre}</strong>
          </p>
        </div>

        <div className="seleccion-form">
          <div className="seleccion-form-group">
            <label htmlFor="materia">Materia de hoy</label>

            {cargando && <p>Cargando materias...</p>}

            {!cargando && error && (
              <div className="sin-clases">
                <span>❌</span>
                <p>{error}</p>
              </div>
            )}

            {!cargando && !error && materias.length === 0 && (
              <div className="sin-clases">
                <span>⚠️</span>
                <p>No tiene materias asignadas para hoy.</p>
              </div>
            )}

            {!cargando && !error && materias.length > 0 && (
              <div className="select-container">
                <span className="select-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="4" width="18" height="17" rx="2" />
                    <path d="M8 2v4" />
                    <path d="M16 2v4" />
                    <path d="M3 10h18" />
                    <path d="M8 14h8" />
                    <path d="M8 17h5" />
                  </svg>
                </span>

                <select
                  id="materia"
                  value={materiaSeleccionada?.id_materia ?? ""}
                  onChange={(event) => {
                    const idMateria = Number(event.target.value);
                    const materia = materias.find(
                      (item) => item.id_materia === idMateria
                    );
                    setMateriaSeleccionada(materia ?? null);
                  }}
                >
                  <option value="">Seleccione una materia</option>
                  {materias.map((materia) => (
                    <option
                      key={materia.id_docente_materia}
                      value={materia.id_materia}
                    >
                      {materia.nombre_materia}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {materiaSeleccionada && (
            <div className="clase-seleccionada">
              <div className="clase-check">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>

              <div>
                <strong>Materia seleccionada</strong>
                <span>{materiaSeleccionada.nombre_materia}</span>
                <span>Día: {materiaSeleccionada.dia_semana}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="boton-continuar"
            onClick={handleContinuar}
            disabled={!materiaSeleccionada}
          >
            Continuar
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Seleccion;
