import { useState, useEffect } from 'react';
import { getDB } from '../db';
import { DigitizeProduct, DigitizeClient, DigitizeRevenue } from '../types/accounting';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

export function useDigitizeRevenue() {
  const [products, setProducts] = useState<DigitizeProduct[]>([]);
  const [clients, setClients] = useState<DigitizeClient[]>([]);
  const [revenues, setRevenues] = useState<DigitizeRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const db = getDB();
      
      // Load products
      const productsStmt = db.prepare(`
        SELECT * FROM digitize_products 
        WHERE is_active = 1
        ORDER BY name
      `);
      const productsData = productsStmt.all();

      // Load clients with their products
      const clientsStmt = db.prepare(`
        SELECT 
          c.*,
          cp.product_id,
          cp.custom_fee,
          cp.start_date as product_start_date,
          cp.end_date as product_end_date
        FROM digitize_clients c
        LEFT JOIN digitize_client_products cp ON c.id = cp.client_id
        ORDER BY c.name
      `);

      const clientsMap = new Map<number, DigitizeClient>();
      
      clientsStmt.all().forEach((row: any) => {
        if (!clientsMap.has(row.id)) {
          clientsMap.set(row.id, {
            id: row.id,
            name: row.name,
            startDate: row.start_date,
            status: row.status,
            products: []
          });
        }

        const client = clientsMap.get(row.id)!;
        if (row.product_id) {
          client.products.push({
            productId: row.product_id,
            customFee: row.custom_fee,
            startDate: row.product_start_date,
            endDate: row.product_end_date
          });
        }
      });

      const clientsData = Array.from(clientsMap.values());

      // Load revenues with product details
      const revenuesStmt = db.prepare(`
        SELECT 
          r.*,
          rp.product_id,
          rp.fee_amount
        FROM digitize_revenue r
        LEFT JOIN digitize_revenue_products rp ON r.id = rp.revenue_id
        ORDER BY r.year DESC, r.month DESC
      `);

      const revenuesMap = new Map<number, DigitizeRevenue>();
      
      revenuesStmt.all().forEach((row: any) => {
        if (!revenuesMap.has(row.id)) {
          revenuesMap.set(row.id, {
            id: row.id,
            clientId: row.client_id,
            month: row.month,
            year: row.year,
            totalAmount: row.total_amount,
            status: row.status,
            products: []
          });
        }

        const revenue = revenuesMap.get(row.id)!;
        if (row.product_id) {
          revenue.products.push({
            productId: row.product_id,
            feeAmount: row.fee_amount
          });
        }
      });

      const revenuesData = Array.from(revenuesMap.values());

      setProducts(productsData);
      setClients(clientsData);
      setRevenues(revenuesData);
    } catch (error) {
      console.error('Error loading Digitize revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<DigitizeProduct, 'id' | 'isActive'>) => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO digitize_products (name, monthly_fee, description)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(product.name, product.monthlyFee, product.description);
    await loadData();
  };

  const addClient = async (
    client: Omit<DigitizeClient, 'id' | 'status' | 'products'>,
    productIds: number[]
  ) => {
    const db = getDB();
    
    db.exec('BEGIN TRANSACTION');
    
    try {
      // Add client
      const clientStmt = db.prepare(`
        INSERT INTO digitize_clients (name, start_date)
        VALUES (?, ?)
      `);
      
      const clientResult = clientStmt.run(client.name, client.startDate);
      const clientId = clientResult.lastInsertRowid;

      // Add product associations
      const productStmt = db.prepare(`
        INSERT INTO digitize_client_products (
          client_id, product_id, start_date
        ) VALUES (?, ?, ?)
      `);

      productIds.forEach(productId => {
        productStmt.run(clientId, productId, client.startDate);
      });

      db.exec('COMMIT');
      await loadData();
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };

  const recordMonthlyRevenue = async (
    clientId: number,
    month: string,
    year: string
  ) => {
    const db = getDB();
    const client = clients.find(c => c.id === clientId);
    
    if (!client) throw new Error('Client not found');

    db.exec('BEGIN TRANSACTION');

    try {
      // Calculate total fees for all active products
      let totalAmount = new Decimal(0);
      const productFees: { productId: number; amount: string }[] = [];

      client.products.forEach(cp => {
        if (!cp.endDate) {
          const product = products.find(p => p.id === cp.productId);
          if (product) {
            const fee = cp.customFee || product.monthlyFee;
            totalAmount = totalAmount.plus(fee);
            productFees.push({
              productId: cp.productId,
              amount: fee
            });
          }
        }
      });

      // Create revenue record
      const revenueStmt = db.prepare(`
        INSERT INTO digitize_revenue (
          client_id, month, year, total_amount
        ) VALUES (?, ?, ?, ?)
      `);

      const revenueResult = revenueStmt.run(
        clientId,
        month,
        year,
        totalAmount.toString()
      );

      // Add product fees
      const productFeeStmt = db.prepare(`
        INSERT INTO digitize_revenue_products (
          revenue_id, product_id, fee_amount
        ) VALUES (?, ?, ?)
      `);

      productFees.forEach(fee => {
        productFeeStmt.run(
          revenueResult.lastInsertRowid,
          fee.productId,
          fee.amount
        );
      });

      db.exec('COMMIT');
      await loadData();
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  };

  const updateProductFee = async (
    clientId: number,
    productId: number,
    newFee: string
  ) => {
    const db = getDB();
    const stmt = db.prepare(`
      UPDATE digitize_client_products
      SET custom_fee = ?
      WHERE client_id = ? AND product_id = ? AND end_date IS NULL
    `);
    
    stmt.run(newFee, clientId, productId);
    await loadData();
  };

  const getClientStats = (clientId: number) => {
    const clientRevenues = revenues.filter(r => r.clientId === clientId);
    
    return {
      totalRevenue: clientRevenues.reduce(
        (sum, r) => sum.plus(r.totalAmount),
        new Decimal(0)
      ),
      activeProducts: clients.find(c => c.id === clientId)?.products.filter(
        p => !p.endDate
      ).length || 0,
      revenueCount: clientRevenues.length
    };
  };

  return {
    products,
    clients,
    revenues,
    loading,
    addProduct,
    addClient,
    recordMonthlyRevenue,
    updateProductFee,
    getClientStats,
    refresh: loadData
  };
}