import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Product } from '../types';

interface ProductDialogProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  open,
  product,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(product?.ProductName || '');
  const [unitPrice, setUnitPrice] = useState(product?.UnitPrice?.toString() || '0.00');
  const [unitsInStock, setUnitsInStock] = useState(product?.UnitsInStock?.toString() || '0');
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    name: false,
    unitPrice: false,
    unitsInStock: false,
  });

  useEffect(() => {
    // Reset form when dialog opens/closes or product changes
    if (open) {
      setName(product?.ProductName || '');
      setUnitPrice(product?.UnitPrice?.toString() || '0.00');
      setUnitsInStock(product?.UnitsInStock?.toString() || '0');
      setError(null);
      setTouched({
        name: false,
        unitPrice: false,
        unitsInStock: false,
      });
    }
  }, [product, open]);

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Product Name is required';
        break;
      case 'unitPrice':
        const price = parseFloat(value);
        if (isNaN(price)) return 'Unit Price must be a valid number';
        if (price < 0) return 'Unit Price cannot be negative';
        break;
      case 'unitsInStock':
        const stock = parseInt(value);
        if (isNaN(stock)) return 'Units in Stock must be a valid number';
        if (stock < 0) return 'Units in Stock cannot be negative';
        if (!Number.isInteger(stock)) return 'Units in Stock must be a whole number';
        break;
    }
    return null;
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = () => {
    // Validate all fields
    const nameError = validateField('name', name);
    const priceError = validateField('unitPrice', unitPrice);
    const stockError = validateField('unitsInStock', unitsInStock);

    // Mark all fields as touched
    setTouched({
      name: true,
      unitPrice: true,
      unitsInStock: true,
    });

    // Show first error if any
    const firstError = nameError || priceError || stockError;
    if (firstError) {
      setError(firstError);
      return;
    }

    const price = parseFloat(unitPrice);
    const stock = parseInt(unitsInStock);

    onSave({
      ProductName: name.trim(),
      UnitPrice: isNaN(price) ? 0 : price,
      UnitsInStock: isNaN(stock) ? 0 : stock
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {product ? 'Edit Product' : 'Add Product'}
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Product Name"
          fullWidth
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (touched.name) {
              setError(validateField('name', e.target.value));
            }
          }}
          onBlur={() => handleBlur('name')}
          error={touched.name && !!validateField('name', name)}
          helperText={touched.name && validateField('name', name)}
          required
        />
        <TextField
          margin="dense"
          label="Unit Price"
          type="number"
          fullWidth
          value={unitPrice}
          onChange={(e) => {
            setUnitPrice(e.target.value);
            if (touched.unitPrice) {
              setError(validateField('unitPrice', e.target.value));
            }
          }}
          onBlur={() => handleBlur('unitPrice')}
          error={touched.unitPrice && !!validateField('unitPrice', unitPrice)}
          helperText={touched.unitPrice && validateField('unitPrice', unitPrice)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: { min: 0, step: 0.01 }
          }}
          required
        />
        <TextField
          margin="dense"
          label="Units in Stock"
          type="number"
          fullWidth
          value={unitsInStock}
          onChange={(e) => {
            setUnitsInStock(e.target.value);
            if (touched.unitsInStock) {
              setError(validateField('unitsInStock', e.target.value));
            }
          }}
          onBlur={() => handleBlur('unitsInStock')}
          error={touched.unitsInStock && !!validateField('unitsInStock', unitsInStock)}
          helperText={touched.unitsInStock && validateField('unitsInStock', unitsInStock)}
          InputProps={{
            inputProps: { min: 0, step: 1 }
          }}
          required
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

export default ProductDialog;
