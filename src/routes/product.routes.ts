
import { Router } from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  patchProduct,
  purchaseProduct,
  purchaseMultipleProducts,
  getPurchaseHistory
} from "../controllers/product.controller";

import { validate } from "../middlewares/validate";

import {
  createProductSchema,
  updateProductSchema,
  patchProductSchema,
  purchaseSchema,
  purchaseMultipleSchema
} from "../schemas/product.schema";

import { validateProductId } from "../middlewares/validateProductId";
import { authenticate } from "../middlewares/authenticate";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();



router.get("/products", getProducts);

router.get(
  "/products/:id",
  validateProductId,
  getProductById
);



router.post(
  "/products",
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  createProduct
);

router.put(
  "/products/:id",
  authenticate,
  requireAdmin,
  validateProductId,
  validate(updateProductSchema),
  updateProduct
);

router.patch(
  "/products/:id",
  authenticate,
  requireAdmin,
  validateProductId,
  validate(patchProductSchema),
  patchProduct
);

router.delete(
  "/products/:id",
  authenticate,
  requireAdmin,
  validateProductId,
  deleteProduct
);


router.post(
  "/products/purchase",
  authenticate,
  validate(purchaseSchema),
  purchaseProduct
);

router.post(
  "/products/purchase-bulk",
  authenticate,
  validate(purchaseMultipleSchema),
  purchaseMultipleProducts
);


router.get(
  "/purchases",
  authenticate,
  getPurchaseHistory
);

export default router;
