import logoIES from "../assets/logo-ies.jpeg";
import "../styles/inicio.css";

function Inicio({ onIniciar }) {
  return (
    <div className="inicio-container">
      <div className="inicio-card">

        <img
          src={logoIES}
          alt="Logo IES"
          className="inicio-logo"
        />

        <h1>¡Buenos días, profe!</h1>

        <p className="inicio-subtitulo">
          Bienvenido al sistema de registro de asistencia
        </p>

        <button
          className="boton-iniciar"
          onClick={onIniciar}
        >
          Iniciar
        </button>

      </div>
    </div>
  );
}

export default Inicio;