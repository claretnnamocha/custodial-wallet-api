import swaggerJsDoc, { Options } from "swagger-jsdoc";
import { description, version, displayName } from "../../package.json";
import { env, port } from "./env";

const swagger: Options = {
  swaggerDefinition: {
    info: {
      version,
      description,
      title: `${displayName} (${env})`,
      contact: { name: "Claret Nnamocha", email: "devclareo@gmail.com" },
      servers: [{ url: `http://localhost:${port}` }],
    },
  },
  apis: ["./src/docs/*.yml"],
};

const config = swaggerJsDoc(swagger);

export { config };
