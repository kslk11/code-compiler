import express from "express";
import { executeCode } from "../services/executeCode.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { language, code, input } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      error: "Code and language are required"
    });
  }

  const result = await executeCode(language, code, input);

  res.json(result);
});

export default router;