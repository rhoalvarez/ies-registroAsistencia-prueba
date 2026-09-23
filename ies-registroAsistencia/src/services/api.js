const API_URL = "http://127.0.0.1:8000";

export const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const texto = await response.text();
  let data = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = texto;
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.detail || "La solicitud no pudo completarse."
    );
    error.response = {
      status: response.status,
      data,
    };
    throw error;
  }

  return data;
};
