export interface Category {
    CategoryID: number;
    CategoryName: string;
    Description: string;
    Picture: string | null;
}

export interface Product {
    ProductID: number;
    ProductName: string;
    CategoryID: number;
    UnitPrice: number;
    UnitsInStock: number;
}

export interface ApiResponse<T> {
    value?: T[];
    data?: T;
}
