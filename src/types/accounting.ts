// Previous types remain...

export interface DigitizeProduct {
  id: number;
  name: string;
  monthlyFee: string;
  description?: string;
  isActive: boolean;
}

export interface DigitizeClient {
  id: number;
  name: string;
  startDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  products: {
    productId: number;
    customFee?: string;
    startDate: string;
    endDate?: string;
  }[];
}

export interface DigitizeRevenue {
  id: number;
  clientId: number;
  month: string;
  year: string;
  totalAmount: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  products: {
    productId: number;
    feeAmount: string;
  }[];
}

// Rest of the types...