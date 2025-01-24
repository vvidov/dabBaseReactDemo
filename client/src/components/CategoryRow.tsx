import React from 'react';
import { Box, Button, IconButton, TableCell, TableRow } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Category } from '../types';

interface CategoryRowProps {
  category: Category;
  productCount: number;
  selected: boolean;
  onSelect: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onViewProducts: (category: Category) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  productCount,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onViewProducts,
}) => {
  return (
    <TableRow 
      key={category.CategoryID}
      onClick={() => onSelect(category)}
      sx={{ 
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' },
        backgroundColor: selected ? 'action.selected' : 'inherit'
      }}
    >
      <TableCell>{category.CategoryID}</TableCell>
      <TableCell>{category.CategoryName}</TableCell>
      <TableCell>{category.Description}</TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={() => onEdit(category)}>
            <EditIcon />
          </IconButton>
          {productCount > 0 ? (
            <Button
              variant="outlined"
              onClick={() => onViewProducts(category)}
            >
              View Products ({productCount})
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="error"
              onClick={() => onDelete(category)}
            >
              Delete Category
            </Button>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default CategoryRow;
