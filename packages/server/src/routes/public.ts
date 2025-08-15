import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
router.use(express.static(path.join(__dirname, "../../res/public")));

export default router;