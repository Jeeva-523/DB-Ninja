const CategoryModel = require('../models/categoryModel');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');

/**
 * Utility function to convert category name into URL-safe slug
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

/**
 * Category REST API Controller
 */
class CategoryController {
  /**
   * Get Paginated Categories
   */
  static async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const result = await CategoryModel.findAll({ page, limit, search, status });
      return ApiResponse.success(res, 200, 'Categories retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Category by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await CategoryModel.findById(id);
      if (!category) {
        throw ApiError.notFound(`Category with ID ${id} not found`);
      }
      return ApiResponse.success(res, 200, 'Category fetched successfully', { category });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Category
   */
  static async create(req, res, next) {
    try {
      const { parentId, name, description, imageUrl } = req.body;

      // 1. Check if name already exists
      const existingName = await CategoryModel.findByName(name);
      if (existingName) {
        throw ApiError.badRequest(`Category with name '${name}' already exists`);
      }

      // 2. Generate slug and ensure slug uniqueness
      let slug = generateSlug(name);
      const existingSlug = await CategoryModel.findBySlug(slug);
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      // 3. Insert into database
      const categoryId = await CategoryModel.create({
        parentId: parentId ? parseInt(parentId, 10) : null,
        name,
        slug,
        description,
        imageUrl
      });

      const newCategory = await CategoryModel.findById(categoryId);
      return ApiResponse.success(res, 201, 'Category created successfully', { category: newCategory });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update Category
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { parentId, name, description, imageUrl, isActive } = req.body;

      // 1. Check if category exists
      const existingCategory = await CategoryModel.findById(id);
      if (!existingCategory) {
        throw ApiError.notFound(`Category with ID ${id} not found`);
      }

      // 2. Prevent setting self as parent category
      if (parentId && parseInt(parentId, 10) === parseInt(id, 10)) {
        throw ApiError.badRequest('A category cannot be its own parent');
      }

      // 3. Generate updated slug if name changed
      let slug = existingCategory.slug;
      if (name && name !== existingCategory.name) {
        const nameDuplicate = await CategoryModel.findByName(name);
        if (nameDuplicate) {
          throw ApiError.badRequest(`Another category with name '${name}' already exists`);
        }
        slug = generateSlug(name);
      }

      await CategoryModel.update(id, {
        parentId: parentId ? parseInt(parentId, 10) : null,
        name: name || existingCategory.name,
        slug,
        description: description !== undefined ? description : existingCategory.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existingCategory.image_url,
        isActive: isActive !== undefined ? isActive : existingCategory.is_active
      });

      const updatedCategory = await CategoryModel.findById(id);
      return ApiResponse.success(res, 200, 'Category updated successfully', { category: updatedCategory });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete Category
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const category = await CategoryModel.findById(id);
      if (!category) {
        throw ApiError.notFound(`Category with ID ${id} not found`);
      }

      // Check referential integrity before deletion
      const hasProducts = await CategoryModel.hasAssociatedProducts(id);
      if (hasProducts) {
        throw ApiError.badRequest('Cannot delete category because active products are assigned to it. Reassign products first.');
      }

      await CategoryModel.delete(id);
      return ApiResponse.success(res, 200, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
