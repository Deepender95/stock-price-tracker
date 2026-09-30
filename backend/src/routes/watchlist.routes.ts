import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  search,
} from "../controllers/watchlist.controller";

const router = Router();

router.use(requireAuth);
router.get("/", getWatchlist);
router.post("/", addToWatchlist);
router.delete("/:symbol", removeFromWatchlist);
router.get("/search", search);

export default router;
