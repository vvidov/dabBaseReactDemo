export interface Category {
    CategoryID: number;
    CategoryName: string;
    Description: string;
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
