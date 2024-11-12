import { useState, useEffect } from 'react';
import { ProsperCalculator } from '../services/prosperCalculator';
import { getDB } from '../db';
import { ProsperTarget, ProsperRevenue, ProsperInvoice } from '../types/accounting';
import Decimal from 'decimal.js';
import { formatISO } from 'date-fns';

export function useProsperRevenue() {
  const [targets, setTargets] = useState<ProsperTarget[]>([]);
  const [revenues, setRevenues] = useState<ProsperRevenue[]>([]);
  const [invoices, setInvoices] = useState<ProsperInvoice[]>([]);
  const [calculator, setCalculator] = useState<ProsperCalculator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (targets.length > 0) {
      setCalculator(new ProsperCalculator(targets));
    }
  }, [targets]);

  const loadData = async () => {
    try {
      const db = getDB();
      const targetsStmt = db.prepare('SELECT * FROM prosper_targets WHERE is_active = 1');
      const revenueStmt = db.prepare(`
        SELECT pr.*, pt.* 
        FROM prosper_revenue pr
        JOIN prosper_targets pt ON pr.target_id = pt.id
        ORDER BY pr.date DESC
      `);
      const invoicesStmt = db.prepare('SELECT * FROM prosper_invoices ORDER BY generated_at DESC');

      const targetsData = targetsStmt.all() as ProsperTarget[];
      const revenuesData = revenueStmt.all() as ProsperRevenue[];
      const invoicesData = invoicesStmt.all() as ProsperInvoice[];

      setTargets(targetsData);
      setRevenues(revenuesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading Prosper revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTarget = (target: Omit<ProsperTarget, 'id' | 'isActive'>) => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO prosper_targets (min_amount, commission_rate, license_fee)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(target.minAmount, target.commissionRate, target.licenseFee);
    loadData();
  };

  const recordRevenue = (grossAmount: string, date: string) => {
    if (!calculator) return;
    const db = getDB();
    const { commission, licenseFee, target, achieved } = calculator.calculateCommission(grossAmount);

    const stmt = db.prepare(`
      INSERT INTO prosper_revenue (
        date, gross_amount, commission, license_fee, target_id, achieved
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(date, grossAmount, commission, licenseFee, target.id, achieved ? 1 : 0);
    loadData();
  };

  const generateInvoice = (month: string, year: string) => {
    const db = getDB();
    const monthlyRevenues = revenues.filter(r => {
      const [revYear, revMonth] = r.date.split('-');
      return revYear === year && revMonth === month;
    });

    const totalGross = monthlyRevenues.reduce((sum, r) => 
      new Decimal(sum).plus(r.grossAmount), new Decimal(0));
    const totalCommission = monthlyRevenues.reduce((sum, r) => 
      new Decimal(sum).plus(r.commission), new Decimal(0));
    const totalLicenseFee = monthlyRevenues.reduce((sum, r) => 
      new Decimal(sum).plus(r.licenseFee), new Decimal(0));

    const stmt = db.prepare(`
      INSERT INTO prosper_invoices (
        month, year, total_gross_amount, total_commission, total_license_fee, status
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(month, year) DO UPDATE SET
        total_gross_amount = excluded.total_gross_amount,
        total_commission = excluded.total_commission,
        total_license_fee = excluded.total_license_fee,
        status = CASE WHEN status = 'PAID' THEN 'PAID' ELSE 'DRAFT' END
    `);

    stmt.run(
      month,
      year,
      totalGross.toString(),
      totalCommission.toString(),
      totalLicenseFee.toString(),
      'DRAFT'
    );

    loadData();
  };

  const getMonthlyStats = (month: string) => {
    const monthlyRevenues = revenues.filter(r => r.date.startsWith(month));
    
    return {
      totalGross: monthlyRevenues.reduce((sum, r) => 
        new Decimal(sum).plus(r.grossAmount), new Decimal(0)),
      totalCommission: monthlyRevenues.reduce((sum, r) => 
        new Decimal(sum).plus(r.commission), new Decimal(0)),
      totalLicenseFees: monthlyRevenues.reduce((sum, r) => 
        new Decimal(sum).plus(r.licenseFee), new Decimal(0)),
      targetsAchieved: monthlyRevenues.filter(r => r.achieved).length
    };
  };

  return {
    targets,
    revenues,
    invoices,
    loading,
    addTarget,
    recordRevenue,
    generateInvoice,
    getMonthlyStats,
    refresh: loadData
  };
}