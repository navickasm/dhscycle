import express from "express";
import path from "path";

const router = express.Router();

router.use(express.static(path.join(__dirname, "../../res/public")));

export default router;