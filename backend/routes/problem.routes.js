import express from "express";
import problems from "../data/problems.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(problems);
});

router.get("/:id", (req, res) => {
  const problem = problems.find(p => p.id == req.params.id);
  res.json(problem);
});

export default router;