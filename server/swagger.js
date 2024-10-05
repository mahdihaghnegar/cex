import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Centralized Exchange API ",
      version: "1.0.0",
      description:
        "API documentation for Centralized Exchange Node.js application",
    },
    servers: [
      {
        url: "http://localhost:5050",
        description: "Local server",
      },
      {
        url: "https://cex-sr.onrender.com",
        description: "Production server",
      },
    ],
  },
  apis: ["./server/routes/*.js"], // Path to the API routes : need start from server
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
export default swaggerDocs;

/*
https://medium.com/@selieshjksofficial/embracing-swagger-in-node-js-a-practical-implementation-guide-05f865c90b8d


https://medium.com/@samuelnoye35/simplifying-api-development-in-node-js-with-swagger-a5021ac45742

*/
