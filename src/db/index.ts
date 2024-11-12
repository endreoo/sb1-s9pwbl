import initSqlJs from 'sql.js';
import { schema } from './schema';
import { formatISO } from 'date-fns';
import { Account, Transaction, VirtualCard } from '../types/accounting';

// Create a singleton instance
let dbInstance: any = null;

// Initialize the database
export const initDB = async () => {
  if (dbInstance) return dbInstance;
  
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  dbInstance = new SQL.Database();
  dbInstance.run(schema);
  return dbInstance;
};

// Export the database getter
export const getDB = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return dbInstance;
};

export const AccountModel = {
  create: async (account: Omit<Account, 'id'>) => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO accounts (name, type, balance)
      VALUES (?, ?, ?)
    `);
    stmt.run([account.name, account.type, account.balance]);
    const result = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    stmt.free();
    return { ...account, id: result };
  },

  getAll: async () => {
    const db = getDB();
    const result = db.exec('SELECT * FROM accounts');
    return result[0]?.values.map((row: any[]) => ({
      id: row[0],
      name: row[1],
      type: row[2],
      balance: row[3]
    })) || [];
  },

  updateBalance: async (id: number, balance: string) => {
    const db = getDB();
    const stmt = db.prepare('UPDATE accounts SET balance = ? WHERE id = ?');
    stmt.run([balance, id]);
    stmt.free();
  }
};

export const TransactionModel = {
  create: async (transaction: Omit<Transaction, 'id'>) => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO transactions (date, description, amount, type, category, reference, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run([
      transaction.date,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.reference,
      transaction.status
    ]);
    const result = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    stmt.free();
    return { ...transaction, id: result };
  },

  getAll: async () => {
    const db = getDB();
    const result = db.exec('SELECT * FROM transactions ORDER BY date DESC');
    return result[0]?.values.map((row: any[]) => ({
      id: row[0],
      date: row[1],
      description: row[2],
      amount: row[3],
      type: row[4],
      category: row[5],
      reference: row[6],
      status: row[7]
    })) || [];
  },

  getRecent: async (limit: number = 5) => {
    const db = getDB();
    const result = db.exec(`SELECT * FROM transactions ORDER BY date DESC LIMIT ${limit}`);
    return result[0]?.values.map((row: any[]) => ({
      id: row[0],
      date: row[1],
      description: row[2],
      amount: row[3],
      type: row[4],
      category: row[5],
      reference: row[6],
      status: row[7]
    })) || [];
  }
};

export const VirtualCardModel = {
  create: async (card: Omit<VirtualCard, 'id' | 'lastUsed' | 'createdAt'>) => {
    const db = getDB();
    const stmt = db.prepare(`
      INSERT INTO virtual_cards (card_number, expiry_date, balance, status)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run([
      card.cardNumber,
      card.expiryDate,
      card.balance,
      card.status
    ]);
    const result = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    stmt.free();
    return { 
      ...card, 
      id: result,
      lastUsed: null,
      createdAt: formatISO(new Date())
    };
  },

  getAll: async () => {
    const db = getDB();
    const result = db.exec('SELECT * FROM virtual_cards ORDER BY created_at DESC');
    return result[0]?.values.map((row: any[]) => ({
      id: row[0],
      cardNumber: row[1],
      expiryDate: row[2],
      balance: row[3],
      status: row[4],
      lastUsed: row[5],
      createdAt: row[6]
    })) || [];
  },

  updateBalance: async (id: number, balance: string) => {
    const db = getDB();
    const stmt = db.prepare(`
      UPDATE virtual_cards 
      SET balance = ?, last_used = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run([balance, id]);
    stmt.free();
  },

  updateStatus: async (id: number, status: VirtualCard['status']) => {
    const db = getDB();
    const stmt = db.prepare('UPDATE virtual_cards SET status = ? WHERE id = ?');
    stmt.run([status, id]);
    stmt.free();
  }
};