import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface CategoryHeaderProps {
  onAddCategory: () => void;
  onAddProduct: () => void;
  showAddProduct?: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  onAddCategory,
  onAddProduct,
  showAddProduct = false,
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h4">Categories</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddCategory}
        >
          Add Category
        </Button>
        {showAddProduct && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddProduct}
          >
            Add Product
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default CategoryHeader;
