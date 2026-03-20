import express from "express";
import cors from "cors";
import runRoutes from "./routes/run.routes.js";
import problemRoutes from "./routes/problem.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/run", runRoutes);
app.use("/api/problems", problemRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});