

import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import {
  CreateProduct,
  UpdateProduct,
  PatchProduct,
  PurchaseMultiple
} from "../schemas/product.schema";

import ProductModel from "../models/product.model";
import PurchaseModel from "../models/purchase.model";

type PurchaseErrorResponse = {
  status: number;
  message: string;
  details?: {
    id: number;
    availableStock: number;
  }[];
};

type PurchasedProduct = {
  id: number;
  name: string;
  quantity: number;
  price: number;
  stock: number;
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await ProductModel.find();
    return res.json(products);
  } catch (error) {
    return next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, name, price, category, stock, image } =
      req.body as CreateProduct;

    const existingProduct = await ProductModel.findOne({ id });

    if (existingProduct) {
      return res.status(409).json({
        message: "Ya existe un producto con ese ID"
      });
    }

    const newProduct = await ProductModel.create({
      id,
      name,
      price,
      category,
      stock,
      image
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        message: "Ya existe un producto con ese ID"
      });
    }

    return next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const product = await ProductModel.findOne({ id });

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.json(product);
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const { name, price, category, stock, image } =
      req.body as UpdateProduct;

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { id },
      { name, price, category, stock, image },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.json(updatedProduct);
  } catch (error) {
    return next(error);
  }
};

export const patchProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const changes = req.body as PatchProduct;

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({
        message: "Debes enviar al menos un campo para actualizar"
      });
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { id },
      changes,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.json(updatedProduct);
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const deletedProduct = await ProductModel.findOneAndDelete({ id });

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Producto no encontrado"
      });
    }

    return res.json({
      message: "Producto eliminado correctamente",
      product: deletedProduct
    });
  } catch (error) {
    return next(error);
  }
};

export const purchaseProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Debes iniciar sesión para realizar una compra"
      });
    }

    const { id, quantity } = req.body as {
      id: number;
      quantity: number;
    };

    const updatedProduct = await ProductModel.findOneAndUpdate(
      {
        id,
        stock: { $gte: quantity }
      },
      {
        $inc: { stock: -quantity }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      const product = await ProductModel.findOne({ id });

      if (!product) {
        return res.status(404).json({
          message: "Producto no encontrado"
        });
      }

      return res.status(409).json({
        message: "Stock insuficiente",
        availableStock: product.stock
      });
    }

    const total = updatedProduct.price * quantity;

    await PurchaseModel.create({
      user: new mongoose.Types.ObjectId(userId),
      items: [
        {
          id: updatedProduct.id,
          name: updatedProduct.name,
          quantity,
          price: updatedProduct.price
        }
      ],
      total
    });

    return res.status(200).json({
      message: "Compra procesada correctamente",
      product: updatedProduct,
      purchasedQuantity: quantity
    });
  } catch (error) {
    return next(error);
  }
};

export const purchaseMultipleProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      message: "Debes iniciar sesión para realizar una compra"
    });
  }

  // Usamos un objeto para que TypeScript pueda seguir
  // correctamente los errores asignados dentro de la transacción.
  const purchaseError: {
    current: PurchaseErrorResponse | null;
  } = {
    current: null
  };

  const session = await mongoose.startSession();

  try {
    const { items } = req.body as PurchaseMultiple;

    let purchasedProducts: PurchasedProduct[] = [];

    let total = 0;

    await session.withTransaction(async () => {
      purchaseError.current = null;

      // 1. Consolidamos productos repetidos.
      const quantities = new Map<number, number>();

      for (const item of items) {
        quantities.set(
          item.id,
          (quantities.get(item.id) ?? 0) + item.quantity
        );
      }

      const consolidatedItems = Array.from(
        quantities,
        ([id, quantity]) => ({ id, quantity })
      );

      // 2. Buscamos los productos.
      const products = await ProductModel.find({
        id: {
          $in: consolidatedItems.map(item => item.id)
        }
      }).session(session);

      // 3. Validamos existencia y stock.
      for (const item of consolidatedItems) {
        const product = products.find(p => p.id === item.id);

        if (!product) {
          purchaseError.current = {
            status: 404,
            message: `No existe el producto con ID ${item.id}`
          };

          throw new Error("PURCHASE_VALIDATION_FAILED");
        }

        if (product.stock < item.quantity) {
          purchaseError.current = {
            status: 409,
            message: `Stock insuficiente para ${product.name}`,
            details: [
              {
                id: product.id,
                availableStock: product.stock
              }
            ]
          };

          throw new Error("PURCHASE_VALIDATION_FAILED");
        }
      }

      purchasedProducts = [];

      // 4. Descontamos el stock dentro de la transacción.
      for (const item of consolidatedItems) {
        const updatedProduct = await ProductModel.findOneAndUpdate(
          {
            id: item.id,
            stock: { $gte: item.quantity }
          },
          {
            $inc: { stock: -item.quantity }
          },
          {
            new: true,
            runValidators: true,
            session
          }
        );

        if (!updatedProduct) {
          purchaseError.current = {
            status: 409,
            message:
              "El stock cambió durante la compra. Intentá nuevamente."
          };

          throw new Error("PURCHASE_VALIDATION_FAILED");
        }

        purchasedProducts.push({
          id: updatedProduct.id,
          name: updatedProduct.name,
          quantity: item.quantity,
          price: updatedProduct.price,
          stock: updatedProduct.stock
        });
      }

      // 5. Calculamos el total.
      total = purchasedProducts.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // 6. Guardamos la compra con el usuario autenticado.
      await PurchaseModel.create(
        [
          {
            user: new mongoose.Types.ObjectId(userId),
            items: purchasedProducts.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            total
          }
        ],
        { session }
      );
    });

    const currentError = purchaseError.current;

    if (currentError !== null) {
      return res.status(currentError.status).json(currentError);
    }

    // 7. Devolvemos la respuesta para el frontend.
    return res.status(200).json({
      message: "Compra procesada correctamente",
      items: purchasedProducts,
      total
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PURCHASE_VALIDATION_FAILED"
    ) {
      const currentError = purchaseError.current;

      if (currentError !== null) {
        return res.status(currentError.status).json(currentError);
      }
    }

    return next(error);
  } finally {
    await session.endSession();
  }
};

export const getPurchaseHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Debes iniciar sesión para consultar tus compras"
      });
    }

    const purchases = await PurchaseModel.find({
      user: new mongoose.Types.ObjectId(userId)
    }).sort({ createdAt: -1 });

    return res.status(200).json(purchases);
  } catch (error) {
    return next(error);
  }
};
