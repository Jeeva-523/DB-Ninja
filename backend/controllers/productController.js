const ProductModel = require('../models/productModel');
const CategoryModel = require('../models/categoryModel');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Controller for Product Catalog & Inventory Management
 */
class ProductController {
  /**
   * Get Paginated Product Catalog
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', categoryId = '', lowStock = false, sortBy = 'id', sortOrder = 'DESC' } = req.query;
      const result = await ProductModel.findAll({
        page,
        limit,
        search,
        categoryId,
        lowStock: lowStock === 'true',
        sortBy,
        sortOrder
      });
      return ApiResponse.success(res, 200, 'Products retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Product by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      if (!product) {
        throw ApiError.notFound(`Product with ID ${id} not found`);
      }
      return ApiResponse.success(res, 200, 'Product details fetched successfully', { product });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Product
   */
  static async create(req, res, next) {
    try {
      const { categoryId, title, sku, description, price, salePrice, costPrice, stockQuantity, lowStockThreshold } = req.body;

      // 1. Verify Category exists
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw ApiError.badRequest(`Category ID ${categoryId} does not exist`);
      }

      // 2. Check SKU uniqueness
      const existingSku = await ProductModel.findBySku(sku);
      if (existingSku) {
        throw ApiError.badRequest(`SKU '${sku}' is already assigned to another product`);
      }

      // 3. Generate Slug
      let slug = generateSlug(title);
      const existingSlug = await ProductModel.findBySlug(slug);
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      // 4. Handle Uploaded Image Path
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const productId = await ProductModel.create({
        categoryId: parseInt(categoryId, 10),
        title,
        slug,
        sku,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        stockQuantity: stockQuantity ? parseInt(stockQuantity, 10) : 0,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : 10,
        imageUrl
      }, req.user?.userId);

      const newProduct = await ProductModel.findById(productId);
      return ApiResponse.success(res, 201, 'Product created successfully', { product: newProduct });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Product
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { categoryId, title, sku, description, price, salePrice, costPrice, lowStockThreshold, isActive } = req.body;

      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        throw ApiError.notFound(`Product with ID ${id} not found`);
      }

      // Handle Image update or keep existing
      let imageUrl = existingProduct.image_url;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      let slug = existingProduct.slug;
      if (title && title !== existingProduct.title) {
        slug = generateSlug(title);
      }

      await ProductModel.update(id, {
        categoryId: categoryId ? parseInt(categoryId, 10) : existingProduct.category_id,
        title: title || existingProduct.title,
        slug,
        sku: sku || existingProduct.sku,
        description: description !== undefined ? description : existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        salePrice: salePrice !== undefined ? (salePrice ? parseFloat(salePrice) : null) : existingProduct.sale_price,
        costPrice: costPrice !== undefined ? (costPrice ? parseFloat(costPrice) : null) : existingProduct.cost_price,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold, 10) : existingProduct.low_stock_threshold,
        imageUrl,
        isActive: isActive !== undefined ? isActive : existingProduct.is_active
      });

      const updatedProduct = await ProductModel.findById(id);
      return ApiResponse.success(res, 200, 'Product updated successfully', { product: updatedProduct });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adjust Stock Level & Record Audit Log
   */
  static async adjustStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantityChanged, changeType, note } = req.body;

      if (!quantityChanged || isNaN(quantityChanged)) {
        throw ApiError.badRequest('Valid quantity change value is required');
      }

      const newStock = await ProductModel.adjustStock(id, {
        quantityChanged: parseInt(quantityChanged, 10),
        changeType,
        note,
        userId: req.user?.userId
      });

      return ApiResponse.success(res, 200, 'Stock level adjusted successfully', {
        productId: id,
        newStockQuantity: newStock
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Product
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      if (!product) {
        throw ApiError.notFound(`Product with ID ${id} not found`);
      }

      await ProductModel.delete(id);
      return ApiResponse.success(res, 200, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
