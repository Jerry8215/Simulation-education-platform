import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /**
       * Por defecto Next solo acepta 1 MB de cuerpo en un Server Action, y las
       * subidas van por ahí (las imágenes de las preguntas y el Excel del banco).
       * Una foto de celular de 2 MB reventaba con un "server error" genérico, sin
       * llegar siquiera a la validación que da el mensaje amable.
       *
       * 4.5 MB es el tope que admite una función serverless en Vercel, así que no
       * tiene sentido pedir más. El archivo en sí se limita a 4 MB (MAX_BYTES en
       * lib/uploads.ts) y el resto queda de holgura para lo que añade el
       * multipart: bordes, cabeceras de cada parte y metadatos.
       */
      bodySizeLimit: '4.5mb',
    },
  },
};

export default nextConfig;
