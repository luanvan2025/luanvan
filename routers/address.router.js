// routes/address.route.js
import express from "express";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import { isLogin } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { addressCreateSchema, addressUpdateSchema } from "../validations/address.validate.js";

const router = express.Router();

router.post("/", isLogin, validate(addressCreateSchema), createAddress);
router.get("/", isLogin, getAddresses);
router.get("/:id", isLogin, getAddressById);
router.put("/:id", isLogin, validate(addressUpdateSchema), updateAddress);
router.delete("/:id", isLogin, deleteAddress);
router.patch("/:id/default", isLogin, setDefaultAddress);

export default router;
