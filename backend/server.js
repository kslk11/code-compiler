import express from "express";
import cors from "cors";
import runRoutes from "./routes/run.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.use("/api/run", runRoutes);

app.listen(5001, () => {
  console.log("Server running on port 5001");
});