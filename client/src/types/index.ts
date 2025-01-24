export interface Category {
  CategoryID: number;
  CategoryName: string;
  Description: string | null;
  Picture: string | null;
}

export interface Product {
  ProductID: number;
  ProductName: string;
  SupplierID: number | null;
  CategoryID: number | null;
  QuantityPerUnit: string | null;
  UnitPrice: number | null;
  UnitsInStock: number | null;
  UnitsOnOrder: number | null;
  ReorderLevel: number | null;
  Discontinued: boolean;
}

export interface ApiResponse<T> {
  value: T[];
}
