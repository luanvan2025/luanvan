import authRouter from './auth.router.js';
import userRoutes from "./user.router.js";
import uploadRoutes from "./upload.router.js";
import addressRouter from "./address.router.js";
import categoryRoutes from "./category.router.js";
import brandRoutes from "./brand.router.js";
import productRoutes from "./product.router.js";
import productVariantRoutes from "./productVariant.router.js";
import productImageRoutes from "./productImage.router.js";
import cartRouter from "./cart.router.js";
import favoriteRouter from "./favorite.router.js";
import productCommentRouter from './productcomments.router.js';
import orderRouter from './order.router.js';
import paymentRouter from './payment.router.js';
import productRatingRouter from './productrating.router.js';

const setupRoutes = (app) => {
  app.use('/api/v1/auth', authRouter);
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/upload", uploadRoutes);
  app.use("/api/v1/address", addressRouter);
  app.use("/api/v1/categories", categoryRoutes);
  app.use("/api/v1/brands", brandRoutes);
  app.use("/api/v1/products", productRoutes);
  app.use("/api/v1/product-variants", productVariantRoutes);
  app.use("/api/v1/product-images", productImageRoutes);
  app.use("/api/v1/cart", cartRouter);
  app.use("/api/v1/favorites", favoriteRouter);
  app.use("/api/v1/product-comments", productCommentRouter);
  app.use("/api/v1/orders", orderRouter);
  app.use("/api/v1/payments", paymentRouter);
  app.use("/api/v1/product-ratings", productRatingRouter);

};

export default setupRoutes;
