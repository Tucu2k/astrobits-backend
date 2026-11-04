
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

const router = Router();

// Catálogo público
router.get("/products", getProducts);

router.get(
  "/products/:id",
  validateProductId,
  getProductById
);

// Administración de productos
router.put(
  "/products/:id",
  validateProductId,
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/products/:id",
  validateProductId,
  deleteProduct
);

router.patch(
  "/products/:id",
  validateProductId,
  validate(patchProductSchema),
  patchProduct
);

router.post(
  "/products",
  validate(createProductSchema),
  createProduct
);

// Compras: requieren autenticación
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

// Historial: requiere autenticación
router.get(
  "/purchases",
  authenticate,
  getPurchaseHistory
);

export default router;
