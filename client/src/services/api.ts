import axios, { AxiosError, AxiosInstance } from 'axios';
import { Category, Product } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add any auth headers or other common headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Transform response data if needed
    return response;
  },
  (error: AxiosError) => {
    // Handle common error cases
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    } else if (error.response?.status === 401) {
      console.error('Unauthorized access');
    } else if (error.response?.status === 500) {
      console.error('Server error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  if (error.response) {
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
  }
  throw error;
};

// Categories API
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('Fetching categories from:', `${API_URL}/categories?$select=CategoryID,CategoryName,Description`);
    const response = await axiosInstance.get<{ value: Category[] }>('/categories?$select=CategoryID,CategoryName,Description');
    return response.data.value;
  } catch (error: any) {
    return handleApiError(error, 'getCategories');
  }
};

export const createCategory = async (category: Omit<Category, 'CategoryID'>): Promise<Category> => {
  try {
    console.log('Creating category:', category);
    const response = await axiosInstance.post<{ value: Category[] }>('/categories', category);
    return response.data.value[0];
  } catch (error: any) {
    return handleApiError(error, 'createCategory');
  }
};

export const updateCategory = async (
  categoryId: number,
  category: Partial<Omit<Category, 'CategoryID'>>
): Promise<Category> => {
  try {
    console.log('Updating category:', categoryId, category);
    const payload = {
      ...category,
      Picture: null // Always include Picture field, set to null if not provided
    };
    const response = await axiosInstance.patch<{ value: Category[] }>(
      `/categories/CategoryID/${categoryId}`,
      payload
    );
    return response.data.value[0];
  } catch (error: any) {
    return handleApiError(error, 'updateCategory');
  }
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  try {
    console.log('Deleting category with ID:', categoryId);
    await axiosInstance.delete(`/categories/CategoryID/${categoryId}`);
    console.log('Delete successful');
  } catch (error: any) {
    return handleApiError(error, 'deleteCategory');
  }
};

// Products API
export const getProducts = async (categoryId: number): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get<{ value: Product[] }>(
      `/products?$filter=CategoryID eq ${categoryId}`
    );
    
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response.data?.value) {
      return response.data.value;
    }
    
    console.error('Unexpected products response format:', response.data);
    return [];
  } catch (error: any) {
    return handleApiError(error, 'getProducts');
  }
};

export const createProduct = async (product: Omit<Product, 'ProductID'>): Promise<Product> => {
  try {
    const response = await axiosInstance.post<{ value: Product[] }>('/products', product);
    return response.data.value[0];
  } catch (error: any) {
    return handleApiError(error, 'createProduct');
  }
};

export const updateProduct = async (
  productId: number,
  product: Partial<Product>
): Promise<Product> => {
  try {
    // Remove any undefined values from the payload
    const cleanProduct = Object.fromEntries(
      Object.entries(product).filter(([_, v]) => v !== undefined)
    );
    
    const response = await axiosInstance.patch<{ value: Product[] }>(
      `/products/ProductID/${productId}`,
      cleanProduct
    );
    return response.data.value[0];
  } catch (error: any) {
    return handleApiError(error, 'updateProduct');
  }
};

export const deleteProduct = async (productId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/products/ProductID/${productId}`);
  } catch (error: any) {
    return handleApiError(error, 'deleteProduct');
  }
};
