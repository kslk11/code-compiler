import express from "express";
import { executeCode } from "../services/executeCode.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { language, code, input } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: "Code and language required"
      });
    }

    const result = await executeCode(language, code, input);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Execution failed"
    });
  }
});

export default router;