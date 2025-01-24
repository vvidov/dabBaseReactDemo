import * as api from '../api';
import type { Category } from '../../types';

describe('Category API Integration Tests', () => {
  let createdCategoryId: number | undefined;

  const testCategory: Omit<Category, 'CategoryID'> = {
    CategoryName: 'Test Cat',
    Description: 'Test Description',
    Picture: null
  };

  // Increase timeout for integration tests since we're hitting a real API
  jest.setTimeout(10000);

  beforeAll(async () => {
    // Verify API is accessible
    try {
      const categories = await api.getCategories();
      console.log('Initial categories count:', categories.length);
    } catch (error) {
      console.error('Failed to connect to API:', error);
      throw error;
    }
  });

  it('should create a new category', async () => {
    try {
      console.log('Attempting to create category with:', testCategory);
      const result = await api.createCategory(testCategory);
      console.log('Create category result:', result);
      
      // Detailed assertions
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result.CategoryID).toBeDefined();
      expect(typeof result.CategoryID).toBe('number');
      expect(result.CategoryName).toBe(testCategory.CategoryName);
      expect(result.Description).toBe(testCategory.Description);
      
      // Store the ID and verify it's a valid number
      createdCategoryId = result.CategoryID;
      expect(createdCategoryId).toBeGreaterThan(0);
      console.log('Successfully created category with ID:', createdCategoryId);
      
      // Verify category was actually created
      const categories = await api.getCategories();
      const foundCategory = categories.find(c => c.CategoryID === createdCategoryId);
      expect(foundCategory).toBeDefined();
      console.log('Found created category in list:', foundCategory);
    } catch (error: any) {
      console.error('Test failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('should get all categories including the new one', async () => {
    expect(createdCategoryId).toBeDefined();
    expect(typeof createdCategoryId).toBe('number');
    
    const categories = await api.getCategories();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    
    const foundCategory = categories.find(c => c.CategoryID === createdCategoryId);
    expect(foundCategory).toBeDefined();
    expect(foundCategory?.CategoryName).toBe(testCategory.CategoryName);
  });

  it('should update the category', async () => {
    expect(createdCategoryId).toBeDefined();
    expect(typeof createdCategoryId).toBe('number');
    
    const updateData = {
      CategoryName: 'Updated Cat',
      Description: 'Updated Description',
      Picture: null
    };

    console.log('Updating category:', createdCategoryId, 'with data:', updateData);
    const result = await api.updateCategory(createdCategoryId!, updateData);
    console.log('Update result:', result);
    
    expect(result.CategoryID).toBe(createdCategoryId);
    expect(result.CategoryName).toBe(updateData.CategoryName);
    expect(result.Description).toBe(updateData.Description);
    expect(result.Picture).toBe(updateData.Picture);

    // Verify the update
    const categories = await api.getCategories();
    const foundCategory = categories.find(c => c.CategoryID === createdCategoryId);
    expect(foundCategory?.CategoryName).toBe(updateData.CategoryName);
    expect(foundCategory?.Description).toBe(updateData.Description);
    expect(foundCategory?.Picture).toBe(updateData.Picture);
  });

  it('should delete the category', async () => {
    try {
      expect(createdCategoryId).toBeDefined();
      expect(typeof createdCategoryId).toBe('number');
      
      console.log('Attempting to delete category with ID:', createdCategoryId);
      await api.deleteCategory(createdCategoryId!);
      console.log('Delete successful');

      // Verify the category was deleted
      const categories = await api.getCategories();
      const foundCategory = categories.find(c => c.CategoryID === createdCategoryId);
      expect(foundCategory).toBeUndefined();
      console.log('Verified category was deleted');
    } catch (error: any) {
      console.error('Delete failed:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });
});
