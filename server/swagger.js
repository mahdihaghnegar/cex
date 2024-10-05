import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Centralized Exchange API ",
      version: "1.0.0",
      description:
        "API documentation for Centralized Exchange Node.js application",
    },
  },
  apis: ["./routes/*.js"], // Path to the API routes
};
const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;

/*
https://medium.com/@selieshjksofficial/embracing-swagger-in-node-js-a-practical-implementation-guide-05f865c90b8d


https://medium.com/@samuelnoye35/simplifying-api-development-in-node-js-with-swagger-a5021ac45742

*/
