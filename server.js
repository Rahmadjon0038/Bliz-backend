const express = require('express');
const swaggerUi = require('swagger-ui-express');
const db = require('./config/db');
const productRouter = require('./routers/products');
const salesRouter = require('./routers/sales');
const reportsRouter = require('./routers/reports');
const swaggerDocument = require('./swagger.json');
const { port } = require('./config/app');
const cors = require('cors')

const app = express();
app.use(express.json());
app.use(cors())

app.use('/api/products', productRouter);
app.use('/api/sales', salesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  const baseUrl = `http://localhost:${port}`;
  console.log(`Server running on ${baseUrl}`);
  console.log(`Products API: ${baseUrl}/api/products`);
  console.log(`Sales API: ${baseUrl}/api/sales`);
  console.log(`Reports API: ${baseUrl}/api/reports`);
  console.log(`Swagger UI: ${baseUrl}/api-docs`);
});
