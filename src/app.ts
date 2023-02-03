import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { router } from "./routes";
import dbConnect from "./config/postgres";

import swaggerUi from "swagger-ui-express";
import swaggerSetup from "./docs/swagger";

const PORT = 3080;
const app = express();

app.use(morgan('dev'))
app.use(cors());
app.use(express.json());

app.use('/api/v2', router)
app.use("/swagger",swaggerUi.serve, swaggerUi.setup(swaggerSetup))



dbConnect().then(() => console.log("Conexion Ready"));
app.listen(PORT, () => console.log(`Listo por el puerto ${PORT}`));
