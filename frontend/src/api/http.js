import axios from "axios";

const CORE_URL = import.meta.env.VITE_CORE_API || "http://127.0.0.1:8080";
const AI_URL = import.meta.env.VITE_AI_API || "http://127.0.0.1:8000";

/** Spring Boot: auth + notes. */
export const core = axios.create({ baseURL: CORE_URL });

/** FastAPI: documents + Gemini. AI calls can be slow, hence the long timeout. */
export const ai = axios.create({ baseURL: AI_URL, timeout: 180000 });

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

// A 401 anywhere (except while signing in) means the session is over.
const handleUnauthorized = (error) => {
  const isAuthCall = /\/auth\/(login|register)/.test(error.config?.url || "");
  if (error.response?.status === 401 && !isAuthCall) {
    window.dispatchEvent(new Event("kc:unauthorized"));
  }
  return Promise.reject(error);
};

for (const client of [core, ai]) {
  client.interceptors.request.use(attachToken);
  client.interceptors.response.use((r) => r, handleUnauthorized);
}

/** Turn any axios error into a sentence a person can act on. */
export function errorMessage(error, fallback = "Something went wrong.", service = "server") {
  if (error?.code === "ERR_NETWORK") {
    return `Can't reach the ${service}. Make sure it's running and try again.`;
  }
  if (error?.code === "ECONNABORTED") {
    return "That took too long. Try again in a moment.";
  }
  const data = error?.response?.data;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg;
  return fallback;
}

export const isNetworkError = (error) => error?.code === "ERR_NETWORK";
