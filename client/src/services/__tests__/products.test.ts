import * as api from '../api';
import type { Product, Category } from '../../types';

describe('Product API Integration Tests', () => {
  let testCategoryId: number | undefined;
  let testProductId: number | undefined;

  const testCategory: Omit<Category, 'CategoryID'> = {
    CategoryName: 'Test Cat',
    Description: 'Test Description',
    Picture: null
  };

  const testProduct: Omit<Product, 'ProductID'> = {
    ProductName: 'Test Product',
    CategoryID: 0, // Will be set after category creation
    UnitPrice: 19.99,
    UnitsInStock: 50
  };

  // Increase timeout for integration tests since we're hitting a real API
  jest.setTimeout(10000);

  beforeAll(async () => {
    // Verify API is accessible and create test category
    try {
      // First verify API access
      const categories = await api.getCategories();
      console.log('Initial categories count:', categories.length);

      // Create test category
      console.log('Creating test category:', testCategory);
      const result = await api.createCategory(testCategory);
      console.log('Created category:', result);
      
      expect(result).toBeDefined();
      expect(result.CategoryID).toBeDefined();
      testCategoryId = result.CategoryID;
      testProduct.CategoryID = testCategoryId;

      // Verify category exists
      const updatedCategories = await api.getCategories();
      const found = updatedCategories.find(c => c.CategoryID === testCategoryId);
      expect(found).toBeDefined();
      console.log('Test category created with ID:', testCategoryId);
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });

  it('should create a product', async () => {
    try {
      expect(testCategoryId).toBeDefined();
      expect(typeof testCategoryId).toBe('number');
      
      console.log('Creating product:', testProduct);
      const result = await api.createProduct(testProduct);
      console.log('Created product:', result);

      // Detailed assertions
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.ProductID).toBeDefined();
      expect(typeof result.ProductID).toBe('number');
      expect(result.ProductName).toBe(testProduct.ProductName);
      expect(result.CategoryID).toBe(testCategoryId);
      expect(result.UnitPrice).toBe(testProduct.UnitPrice);
      expect(result.UnitsInStock).toBe(testProduct.UnitsInStock);

      testProductId = result.ProductID;
      expect(testProductId).toBeGreaterThan(0);
      console.log('Successfully created product with ID:', testProductId);

      // Verify product exists
      const products = await api.getProducts(testCategoryId!);
      const foundProduct = products.find(p => p.ProductID === testProductId);
      expect(foundProduct).toBeDefined();
      console.log('Found created product in list:', foundProduct);
    } catch (error: any) {
      console.error('Failed to create product:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('should get products for category', async () => {
    try {
      expect(testCategoryId).toBeDefined();
      expect(testProductId).toBeDefined();
      
      console.log('Getting products for category:', testCategoryId);
      const products = await api.getProducts(testCategoryId!);
      console.log('Got products:', products);
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      
      const foundProduct = products.find(p => p.ProductID === testProductId);
      expect(foundProduct).toBeDefined();
      expect(foundProduct?.ProductName).toBe(testProduct.ProductName);
      expect(foundProduct?.CategoryID).toBe(testCategoryId);
      expect(foundProduct?.UnitPrice).toBe(testProduct.UnitPrice);
      expect(foundProduct?.UnitsInStock).toBe(testProduct.UnitsInStock);
      console.log('Found product in list:', foundProduct);
    } catch (error: any) {
      console.error('Failed to get products:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('should update a product', async () => {
    try {
      expect(testProductId).toBeDefined();
      expect(typeof testProductId).toBe('number');
      
      const updateData = {
        ProductName: 'Updated Product',
        UnitPrice: 29.99,
        UnitsInStock: 75
      };

      console.log('Updating product:', testProductId, 'with:', updateData);
      const result = await api.updateProduct(testProductId!, updateData);
      console.log('Updated product:', result);

      // Verify update was successful
      expect(result.ProductName).toBe(updateData.ProductName);
      expect(result.UnitPrice).toBe(updateData.UnitPrice);
      expect(result.UnitsInStock).toBe(updateData.UnitsInStock);
      expect(result.CategoryID).toBe(testCategoryId); // Category should not change

      // Verify update is reflected in GET request
      const products = await api.getProducts(testCategoryId!);
      const updatedProduct = products.find(p => p.ProductID === testProductId);
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct?.ProductName).toBe(updateData.ProductName);
      expect(updatedProduct?.UnitPrice).toBe(updateData.UnitPrice);
      expect(updatedProduct?.UnitsInStock).toBe(updateData.UnitsInStock);
      console.log('Update verified:', updatedProduct);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('should delete a product', async () => {
    try {
      expect(testProductId).toBeDefined();
      expect(typeof testProductId).toBe('number');
      
      console.log('Deleting product:', testProductId);
      await api.deleteProduct(testProductId!);
      console.log('Product deleted');

      // Verify deletion
      const products = await api.getProducts(testCategoryId!);
      const shouldNotExist = products.find(p => p.ProductID === testProductId);
      expect(shouldNotExist).toBeUndefined();
      console.log('Deletion verified');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('should handle invalid operations gracefully', async () => {
    // Test invalid product ID for update
    try {
      console.log('Testing invalid product update...');
      await api.updateProduct(99999, { ProductName: 'Invalid' });
      fail('Expected update of invalid product to fail');
    } catch (error) {
      expect(error).toBeDefined();
      console.log('Invalid update failed as expected');
    }

    // Test invalid product ID for delete
    try {
      console.log('Testing invalid product delete...');
      await api.deleteProduct(99999);
      fail('Expected delete of invalid product to fail');
    } catch (error) {
      expect(error).toBeDefined();
      console.log('Invalid delete failed as expected');
    }

    // Test invalid category ID for get products
    console.log('Testing invalid category products...');
    const products = await api.getProducts(99999);
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBe(0);
    console.log('Invalid category handled correctly');
  });

  it('should validate product data on create', async () => {
    try {
      expect(testCategoryId).toBeDefined();

      // Test missing required fields
      const invalidProduct = {
        CategoryID: testCategoryId!
        // Missing ProductName, UnitPrice, UnitsInStock
      };
      
      console.log('Testing product creation with missing fields:', invalidProduct);
      // @ts-ignore - intentionally testing invalid type
      await api.createProduct(invalidProduct);
      fail('Expected creation with missing fields to fail');
    } catch (error: any) {
      expect(error).toBeDefined();
      console.log('Invalid creation failed as expected');
    }

    try {
      // Test invalid data types
      const invalidProduct = {
        ProductName: 123, // Should be string
        CategoryID: testCategoryId!,
        UnitPrice: 'invalid', // Should be number
        UnitsInStock: '50' // Should be number
      };
      
      console.log('Testing product creation with invalid types:', invalidProduct);
      // @ts-ignore - intentionally testing invalid type
      await api.createProduct(invalidProduct);
      fail('Expected creation with invalid types to fail');
    } catch (error: any) {
      expect(error).toBeDefined();
      console.log('Invalid types failed as expected');
    }

    try {
      // Test invalid values
      const invalidProduct = {
        ProductName: 'Test Product',
        CategoryID: testCategoryId!,
        UnitPrice: -10, // Should be positive
        UnitsInStock: -5 // Should be positive
      };
      
      console.log('Testing product creation with invalid values:', invalidProduct);
      await api.createProduct(invalidProduct);
      fail('Expected creation with invalid values to fail');
    } catch (error: any) {
      expect(error).toBeDefined();
      console.log('Invalid values failed as expected');
    }
  });

  it('should validate product data on update', async () => {
    try {
      // Create a valid product first
      const product = await api.createProduct({
        ProductName: 'Update Test Product',
        CategoryID: testCategoryId!,
        UnitPrice: 10,
        UnitsInStock: 10
      });
      
      // Test invalid update data
      const invalidUpdate = {
        UnitPrice: -20, // Should be positive
        UnitsInStock: -10 // Should be positive
      };
      
      console.log('Testing product update with invalid values:', invalidUpdate);
      await api.updateProduct(product.ProductID, invalidUpdate);
      fail('Expected update with invalid values to fail');
    } catch (error: any) {
      expect(error).toBeDefined();
      console.log('Invalid update values failed as expected');
    }

    try {
      // Test invalid data types
      const invalidUpdate = {
        ProductName: 123, // Should be string
        UnitPrice: '20', // Should be number
        UnitsInStock: '10' // Should be number
      };
      
      console.log('Testing product update with invalid types:', invalidUpdate);
      // @ts-ignore - intentionally testing invalid type
      await api.updateProduct(testProductId!, invalidUpdate);
      fail('Expected update with invalid types to fail');
    } catch (error: any) {
      expect(error).toBeDefined();
      console.log('Invalid update types failed as expected');
    }
  });

  it('should handle concurrent operations correctly', async () => {
    // Create a test product
    const product = await api.createProduct({
      ProductName: 'Concurrent Test Product',
      CategoryID: testCategoryId!,
      UnitPrice: 15,
      UnitsInStock: 20
    });

    // Attempt concurrent updates
    const updates = [
      { ProductName: 'Update 1', UnitPrice: 25 },
      { ProductName: 'Update 2', UnitPrice: 30 },
      { ProductName: 'Update 3', UnitPrice: 35 }
    ];

    console.log('Testing concurrent updates...');
    const results = await Promise.allSettled(
      updates.map(update => api.updateProduct(product.ProductID, update))
    );

    // Verify that at least one update succeeded
    const succeeded = results.some(result => result.status === 'fulfilled');
    expect(succeeded).toBe(true);
    console.log('Concurrent updates completed');

    // Verify final state
    const products = await api.getProducts(testCategoryId!);
    const updatedProduct = products.find(p => p.ProductID === product.ProductID);
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct?.UnitPrice).toBeGreaterThan(15); // Should be updated
    console.log('Final product state:', updatedProduct);

    // Cleanup
    await api.deleteProduct(product.ProductID);
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      // Delete test product if it exists
      if (testProductId) {
        try {
          await api.deleteProduct(testProductId);
          console.log('Cleaned up test product');
        } catch (error) {
          console.warn('Failed to cleanup product:', error);
        }
      }

      // Delete test category
      if (testCategoryId) {
        try {
          await api.deleteCategory(testCategoryId);
          console.log('Cleaned up test category');
        } catch (error) {
          console.warn('Failed to cleanup category:', error);
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });
});
