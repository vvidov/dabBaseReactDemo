import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { Category } from '../types';

interface CategoryDialogProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  category,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(category?.CategoryName || '');
  const [description, setDescription] = useState(category?.Description || '');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    description: false,
  });

  useEffect(() => {
    // Reset form when dialog opens/closes or category changes
    if (open) {
      setName(category?.CategoryName || '');
      setDescription(category?.Description || '');
      setError(null);
      setTouched({
        name: false,
        description: false,
      });
    }
  }, [category, open]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Category Name is required');
      return;
    }
    
    onSave({
      CategoryName: name.trim(),
      Description: description.trim()
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {category ? 'Edit Category' : 'Add Category'}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Category Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
