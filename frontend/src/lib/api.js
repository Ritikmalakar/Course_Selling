const configuredServerUrl = import.meta.env.VITE_API_URL?.trim()

if (import.meta.env.PROD && !configuredServerUrl) {
  throw new Error("VITE_API_URL must be set to the deployed backend URL.")
}

export const serverUrl = (configuredServerUrl || "http://localhost:1112").replace(/\/+$/, "")
