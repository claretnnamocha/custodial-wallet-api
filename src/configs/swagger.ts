import swaggerJsDoc, { Options } from "swagger-jsdoc";
import { description, version, displayName } from "../../package.json";
import { env, port } from "./env";

let apis = ["./src/docs/*.yml"];
if (env === "development") apis.push("./src/docs/*.yaml");

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
  apis,
};

const config = swaggerJsDoc(swagger);

export { config };
