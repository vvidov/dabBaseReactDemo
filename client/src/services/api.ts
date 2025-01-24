import axios from 'axios';
import type { Category, Product } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Categories API
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories from:', `${API_URL}/categories`);
    const response = await axios.get<{ value: Category[] }>(`${API_URL}/categories`);
    console.log('Categories response:', response.data);
    return response.data.value;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const createCategory = async (category: Omit<Category, 'CategoryID'>): Promise<Category> => {
  try {
    const payload = {
      ...category,
      Picture: null // Always include Picture field, set to null if not provided
    };
    console.log('Creating category:', payload);
    const response = await axios.post<{ value: Category[] }>(`${API_URL}/categories`, payload);
    console.log('Create response:', response.data);
    return response.data.value[0];
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const updateCategory = async (categoryId: number, category: Partial<Omit<Category, 'CategoryID'>>): Promise<Category> => {
  try {
    console.log('Updating category:', categoryId, category);
    const payload = {
      ...category,
      Picture: null // Always include Picture field, set to null if not provided
    };
    const response = await axios.patch<{ value: Category[] }>(`${API_URL}/categories/CategoryID/${categoryId}`, payload);
    console.log('Update response:', response.data);
    return response.data.value[0];
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  try {
    console.log('Deleting category with ID:', categoryId);
    await axios.delete(`${API_URL}/categories/CategoryID/${categoryId}`);
    console.log('Delete successful');
  } catch (error: any) {
    console.error('Error deleting category:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Products API
export const getProducts = async (categoryId: number): Promise<Product[]> => {
  try {
    const response = await axios.get(`${API_URL}/products?$filter=CategoryID eq ${categoryId}`);
    console.log('Raw Products API Response:', response);
    
    // Check if response.data is already an array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Check if response.data has a value property that's an array
    if (response.data && Array.isArray(response.data.value)) {
      return response.data.value;
    }
    
    console.error('Unexpected products response format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'ProductID'>): Promise<Product> => {
  try {
    const payload = {
      ...product
    };
    console.log('Creating product with payload:', payload);
    const response = await axios.post<{ value: Product[] }>(`${API_URL}/products`, payload);
    console.log('Create product response:', response.data);
    return response.data.value[0];
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const updateProduct = async (productId: number, product: Partial<Product>): Promise<Product> => {
  try {
    // Remove any undefined values from the payload
    const cleanProduct = Object.fromEntries(
      Object.entries(product).filter(([_, v]) => v !== undefined)
    );
    
    const payload = {
      ...cleanProduct
    };
    
    console.log('Updating product with payload:', payload);
    const response = await axios.patch<{ value: Product[] }>(`${API_URL}/products/ProductID/${productId}`, payload);
    console.log('Update product response:', response.data);
    return response.data.value[0];
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

export const deleteProduct = async (productId: number): Promise<void> => {
  try {
    console.log('Deleting product with ID:', productId);
    const response = await axios.delete(`${API_URL}/products/ProductID/${productId}`, {
      data: { ProductID: productId }
    });
    console.log('Delete Product API Response:', response.status);
    // 204 means success with no content
    if (response.status !== 204) {
      throw new Error('Unexpected response from server');
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      if (error.response.status === 400) {
        throw new Error('Invalid product ID or product not found');
      }
    }
    throw error;
  }
};
