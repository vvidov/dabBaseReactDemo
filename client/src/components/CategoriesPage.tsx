import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Paper,
  Button,
  Typography,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import * as api from '../services/api';
import { Category, Product } from '../types';
import CategoryHeader from './CategoryHeader';
import CategoryRow from './CategoryRow';
import CategoryDialog from './CategoryDialog';
import ProductDialog from './ProductDialog';
import ConfirmDialog from './ConfirmDialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<Record<number, number>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
      
      // Fetch product counts for each category
      const productCounts: Record<number, number> = {};
      for (const category of data) {
        const products = await api.getProducts(category.CategoryID);
        productCounts[category.CategoryID] = products.length;
      }
      setCategoryProducts(productCounts);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts(categoryId);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await api.deleteCategory(categoryToDelete.CategoryID);
      // If we're deleting the currently selected category, clear it
      if (selectedCategory?.CategoryID === categoryToDelete.CategoryID) {
        setSelectedCategory(null);
      }
      await fetchCategories();
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (selectedCategory) {
        await api.updateCategory(selectedCategory.CategoryID, categoryData);
      } else {
        // Ensure required fields are present for new category
        const newCategory: Omit<Category, 'CategoryID'> = {
          CategoryName: categoryData.CategoryName || '',
          Description: categoryData.Description || '',
          Picture: null
        };
        await api.createCategory(newCategory);
      }
      await fetchCategories();
      setSelectedCategory(null);
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category');
    }
  };

  const handleViewProducts = async (category: Category) => {
    setSelectedCategory(category); // Set the selected category
    setShowProducts(true);
    await fetchProducts(category.CategoryID);
  };

  const handleBackToCategories = () => {
    setShowProducts(false);
  };

  const handleAddProduct = () => {
    if (!selectedCategory) {
      setError('Please select a category first');
      return;
    }
    setSelectedProduct(null);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      console.log('Confirming delete for product:', productToDelete);
      await api.deleteProduct(productToDelete.ProductID);
      
      // Refresh the products list
      if (selectedCategory) {
        await fetchProducts(selectedCategory.CategoryID);
        
        // Update product count
        const products = await api.getProducts(selectedCategory.CategoryID);
        setCategoryProducts(prev => ({
          ...prev,
          [selectedCategory.CategoryID]: products.length
        }));
      }
      
      // Close dialog and clean up
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      setError(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product. Please try again.');
      // Close dialog on error since we can't retry the same delete
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (!selectedCategory) {
      setError('No category selected');
      return;
    }

    try {
      if (selectedProduct) {
        // For updates, only send changed fields
        const updateData: Partial<Product> = {};
        
        if (productData.ProductName !== selectedProduct.ProductName) {
          updateData.ProductName = productData.ProductName;
        }
        if (productData.UnitPrice !== selectedProduct.UnitPrice) {
          updateData.UnitPrice = productData.UnitPrice;
        }
        if (productData.UnitsInStock !== selectedProduct.UnitsInStock) {
          updateData.UnitsInStock = productData.UnitsInStock;
        }
        
        // Only update if there are changes
        if (Object.keys(updateData).length > 0) {
          await api.updateProduct(selectedProduct.ProductID, updateData);
        }
      } else {
        // For new products
        const newProduct: Omit<Product, 'ProductID'> = {
          ProductName: productData.ProductName || '',
          CategoryID: selectedCategory.CategoryID,
          UnitPrice: productData.UnitPrice || 0,
          UnitsInStock: productData.UnitsInStock || 0
        };
        await api.createProduct(newProduct);
      }

      // Refresh the products list
      await fetchProducts(selectedCategory.CategoryID);
      
      // Update product count
      const products = await api.getProducts(selectedCategory.CategoryID);
      setCategoryProducts(prev => ({
        ...prev,
        [selectedCategory.CategoryID]: products.length
      }));

      setProductDialogOpen(false);
      setSelectedProduct(null);
      setError(null);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    }
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    // Clear any existing error message
    setError(null);
  };

  const handleCloseConfirm = () => {
    setDeleteConfirmOpen(false);
    setProductToDelete(null);
  };

  if (showProducts) {
    return (
      <div>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToCategories}
          >
            Back to Categories
          </Button>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              Products in {selectedCategory?.CategoryName}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {products.length === 0 ? (
          <Alert severity="info">No products found in this category</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Unit Price</TableCell>
                  <TableCell>Units in Stock</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow 
                    key={product.ProductID}
                    sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                  >
                    <TableCell>{product.ProductID}</TableCell>
                    <TableCell>{product.ProductName}</TableCell>
                    <TableCell>${product.UnitPrice?.toFixed(2)}</TableCell>
                    <TableCell>{product.UnitsInStock}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleEditProduct(product)}
                          color="primary"
                          size="small"
                          title="Edit Product"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDeleteProduct(product)}
                          color="error"
                          size="small"
                          title="Delete Product"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <ProductDialog
          open={productDialogOpen}
          product={selectedProduct}
          onClose={() => setProductDialogOpen(false)}
          onSave={handleSaveProduct}
        />

        {/* Add ConfirmDialog for product deletion */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          title="Delete Product"
          message={productToDelete ? `Are you sure you want to delete the product "${productToDelete.ProductName}"?` : ''}
          onConfirm={confirmDeleteProduct}
          onClose={handleCloseConfirm}
        />
      </div>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <CategoryHeader 
        onAddCategory={handleAddCategory}
        onAddProduct={handleAddProduct}
        showAddProduct={selectedCategory !== null}
      />
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        categories.length === 0 ? (
          <Alert severity="info">No categories found</Alert>
        ) : (
          <>
            {selectedCategory && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Selected Category: {selectedCategory.CategoryName}
              </Alert>
            )}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <CategoryRow
                      key={category.CategoryID}
                      category={category}
                      productCount={categoryProducts[category.CategoryID]}
                      selected={selectedCategory?.CategoryID === category.CategoryID}
                      onSelect={handleSelectCategory}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                      onViewProducts={handleViewProducts}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )
      )}

      <CategoryDialog
        open={categoryDialogOpen}
        category={selectedCategory}
        onClose={() => setCategoryDialogOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Add ProductDialog to main view */}
      <ProductDialog
        open={productDialogOpen}
        product={selectedProduct}
        onClose={() => {
          setProductDialogOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={productToDelete ? 'Delete Product' : 'Delete Category'}
        message={productToDelete 
          ? `Are you sure you want to delete the product "${productToDelete.ProductName}"?`
          : categoryToDelete 
            ? `Are you sure you want to delete the category "${categoryToDelete.CategoryName}"?`
            : ''
        }
        onConfirm={productToDelete ? confirmDeleteProduct : confirmDeleteCategory}
        onClose={handleCloseConfirm}
      />
    </Box>
  );
};

export default CategoriesPage;
