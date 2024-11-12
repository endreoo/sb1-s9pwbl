import { useState, useEffect } from 'react';
import { getDB } from '../db';
import { 
  BaseInvoice, 
  ProsperInvoice, 
  StandardInvoice, 
  CommissionInvoice,
  InvoiceType,
  InvoiceStatus,
  InvoiceItem 
} from '../types/accounting';
import Decimal from 'decimal.js';
import { format } from 'date-fns';

export function useInvoices(type?: InvoiceType) {
  const [invoices, setInvoices] = useState<BaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, [type]);

  const loadInvoices = async () => {
    try {
      const db = getDB();
      const query = type 
        ? 'SELECT * FROM invoices WHERE type = ? ORDER BY date DESC'
        : 'SELECT * FROM invoices ORDER BY date DESC';
      
      const stmt = db.prepare(query);
      const invoicesData = type ? stmt.all(type) : stmt.all();
      
      // Load items for standard invoices
      if (type === 'STANDARD') {
        const itemsStmt = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?');
        invoicesData.forEach((invoice: StandardInvoice) => {
          invoice.items = itemsStmt.all(invoice.id) as InvoiceItem[];
        });
      }

      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = (type: InvoiceType) => {
    const db = getDB();
    const stmt = db.prepare(`
      UPDATE invoice_sequences 
      SET last_number = last_number + 1 
      WHERE type = ? 
      RETURNING prefix || printf('%06d', last_number)
    `);
    const result = stmt.get(type) as { prefix: string; last_number: number };
    return result[0];
  };

  const createInvoice = async <T extends BaseInvoice>(
    invoiceData: Omit<T, 'id' | 'number' | 'createdAt' | 'updatedAt'>
  ) => {
    const db = getDB();
    const number = generateInvoiceNumber(invoiceData.type);
    
    const stmt = db.prepare(`
      INSERT INTO invoices (
        type, number, date, due_date, status, subtotal, tax, total,
        notes, month, year, total_gross_amount, total_commission,
        total_license_fee, client_id, agent_id, commission_rate,
        base_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      invoiceData.type,
      number,
      invoiceData.date,
      invoiceData.dueDate,
      invoiceData.status,
      invoiceData.subtotal,
      invoiceData.tax,
      invoiceData.total,
      invoiceData.notes,
      (invoiceData as ProsperInvoice).month,
      (invoiceData as ProsperInvoice).year,
      (invoiceData as ProsperInvoice).totalGrossAmount,
      (invoiceData as ProsperInvoice).totalCommission,
      (invoiceData as ProsperInvoice).totalLicenseFee,
      (invoiceData as StandardInvoice).clientId,
      (invoiceData as CommissionInvoice).agentId,
      (invoiceData as CommissionInvoice).commissionRate,
      (invoiceData as CommissionInvoice).baseAmount
    );

    // Add items for standard invoices
    if (invoiceData.type === 'STANDARD') {
      const itemsStmt = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, description, quantity, unit_price, amount
        ) VALUES (?, ?, ?, ?, ?)
      `);

      (invoiceData as StandardInvoice).items.forEach(item => {
        itemsStmt.run(
          result.lastInsertRowid,
          item.description,
          item.quantity,
          item.unitPrice,
          item.amount
        );
      });
    }

    await loadInvoices();
    return result.lastInsertRowid;
  };

  const updateStatus = async (id: number, status: InvoiceStatus) => {
    const db = getDB();
    const stmt = db.prepare(`
      UPDATE invoices 
      SET status = ?, 
          updated_at = CURRENT_TIMESTAMP,
          paid_at = CASE WHEN ? = 'PAID' THEN CURRENT_TIMESTAMP ELSE paid_at END
      WHERE id = ?
    `);
    
    stmt.run(status, status, id);
    await loadInvoices();
  };

  return {
    invoices,
    loading,
    createInvoice,
    updateStatus,
    refresh: loadInvoices
  };
}