import { useState, useEffect } from 'react';
import { getDB } from '../db';
import { ConnectClient, ConnectRevenue } from '../types/accounting';
import Decimal from 'decimal.js';
import { formatISO } from 'date-fns';

export function useConnectRevenue() {
  const [clients, setClients] = useState<ConnectClient[]>([]);
  const [revenues, setRevenues] = useState<ConnectRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const db = getDB();
      
      // Load clients
      const clientsStmt = db.prepare(`
        SELECT * FROM connect_clients 
        ORDER BY name
      `);
      const clientsData = clientsStmt.all();

      // Load revenues
      const revenuesStmt = db.prepare(`
        SELECT * FROM connect_revenue
        ORDER BY date DESC
      `);
      const revenuesData = revenuesStmt.all();

      setClients(clientsData);
      setRevenues(revenuesData);
    } catch (error) {
      console.error('Error loading Connect revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (client: Omit<ConnectClient, 'id' | 'status'>) => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO connect_clients (name, commission_rate, start_date)
      VALUES (?, ?, ?)
    `);
    
    stmt.run(client.name, client.commissionRate, client.startDate);
    await loadData();
  };

  const recordRevenue = async (
    clientId: number,
    grossBookings: string,
    date: string
  ) => {
    const db = getDB();
    const client = clients.find(c => c.id === clientId);
    
    if (!client) throw new Error('Client not found');

    const grossAmount = new Decimal(grossBookings);
    const commission = grossAmount.times(client.commissionRate).dividedBy(100);

    const stmt = db.prepare(`
      INSERT INTO connect_revenue (
        client_id, date, gross_bookings, commission
      ) VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      clientId,
      date,
      grossBookings,
      commission.toString()
    );

    await loadData();
  };

  const getClientStats = (clientId: number) => {
    const clientRevenues = revenues.filter(r => r.clientId === clientId);
    
    return {
      totalGrossBookings: clientRevenues.reduce(
        (sum, r) => sum.plus(r.grossBookings),
        new Decimal(0)
      ),
      totalCommission: clientRevenues.reduce(
        (sum, r) => sum.plus(r.commission),
        new Decimal(0)
      ),
      revenueCount: clientRevenues.length
    };
  };

  const updateClientStatus = async (clientId: number, status: ConnectClient['status']) => {
    const db = getDB();
    const stmt = db.prepare(`
      UPDATE connect_clients
      SET status = ?
      WHERE id = ?
    `);
    
    stmt.run(status, clientId);
    await loadData();
  };

  return {
    clients,
    revenues,
    loading,
    addClient,
    recordRevenue,
    getClientStats,
    updateClientStatus,
    refresh: loadData
  };
}