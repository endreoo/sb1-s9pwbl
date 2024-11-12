import { useState, useEffect } from 'react';
import { getDB } from '../db';
import { GrowProduct, GrowClient, GrowRevenue, ProductPricing } from '../types/accounting';
import Decimal from 'decimal.js';
import { formatISO } from 'date-fns';

export function useGrowRevenue() {
  const [products, setProducts] = useState<GrowProduct[]>([]);
  const [clients, setClients] = useState<GrowClient[]>([]);
  const [revenues, setRevenues] = useState<GrowRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const db = getDB();
      
      // Load products
      const productsStmt = db.prepare(`
        SELECT * FROM grow_products 
        WHERE is_active = 1
        ORDER BY name
      `);
      const productsData = productsStmt.all();

      // Load clients with their products and pricing
      const clientsStmt = db.prepare(`
        SELECT 
          c.*,
          cp.product_id,
          gpp.license_fee as custom_fee
        FROM grow_clients c
        LEFT JOIN grow_client_products cp ON c.id = cp.client_id
        LEFT JOIN grow_product_pricing gpp ON (
          c.id = gpp.client_id 
          AND cp.product_id = gpp.product_id
          AND gpp.end_date IS NULL
        )
        WHERE cp.end_date IS NULL
        ORDER BY c.name
      `);

      const clientsMap = new Map<number, GrowClient>();
      
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
            pricing: row.custom_fee ? {
              clientId: row.id,
              productId: row.product_id,
              licenseFee: row.custom_fee,
              startDate: row.start_date
            } : undefined
          });
        }
      });

      const clientsData = Array.from(clientsMap.values());

      // Load revenues with product fees
      const revenuesStmt = db.prepare(`
        SELECT 
          r.*,
          GROUP_CONCAT(rpf.product_id || ':' || rpf.amount) as fee_details
        FROM grow_revenue r
        LEFT JOIN grow_revenue_product_fees rpf ON r.id = rpf.revenue_id
        GROUP BY r.id
        ORDER BY r.date DESC
      `);

      const revenuesData = revenuesStmt.all().map(revenue => ({
        ...revenue,
        licenseFees: revenue.fee_details ? 
          revenue.fee_details.split(',').map(detail => {
            const [productId, amount] = detail.split(':');
            return { productId: Number(productId), amount };
          }) : []
      }));

      setProducts(productsData);
      setClients(clientsData);
      setRevenues(revenuesData);
    } catch (error) {
      console.error('Error loading Grow revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<GrowProduct, 'id' | 'isActive'>) => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO grow_products (name, standard_license_fee, description)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(product.name, product.standardLicenseFee, product.description);
    await loadData();
  };

  const updateProductPricing = async (pricing: ProductPricing) => {
    const db = getDB();
    
    // End current pricing if exists
    const endCurrentStmt = db.prepare(`
      UPDATE grow_product_pricing
      SET end_date = ?
      WHERE client_id = ? AND product_id = ? AND end_date IS NULL
    `);
    
    endCurrentStmt.run(
      formatISO(new Date()),
      pricing.clientId,
      pricing.productId
    );

    // Add new pricing
    const addPricingStmt = db.prepare(`
      INSERT INTO grow_product_pricing (
        client_id, product_id, license_fee, start_date
      ) VALUES (?, ?, ?, ?)
    `);

    addPricingStmt.run(
      pricing.clientId,
      pricing.productId,
      pricing.licenseFee,
      pricing.startDate
    );

    await loadData();
  };

  const getProductPrice = (productId: number, clientId: number): string => {
    const client = clients.find(c => c.id === clientId);
    const product = products.find(p => p.id === productId);
    
    if (!product) return '0';

    const clientProduct = client?.products.find(p => p.productId === productId);
    return clientProduct?.pricing?.licenseFee || product.standardLicenseFee;
  };

  // Rest of the code remains the same...

  return {
    products,
    clients,
    revenues,
    loading,
    addProduct,
    updateProductPricing,
    getProductPrice,
    recordRevenue,
    getClientStats,
    refresh: loadData
  };
}