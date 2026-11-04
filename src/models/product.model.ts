import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
     stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
      validator: Number.isInteger,
      message: "El stock debe ser un número entero"
  }
},
    image: {
  type: String,
  required: false,
  trim: true
}
  },
  {
    timestamps: true
  }
);

const ProductModel = mongoose.model("Product", productSchema);

export default ProductModel;