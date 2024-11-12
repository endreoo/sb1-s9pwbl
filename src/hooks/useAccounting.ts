import { useState, useEffect } from 'react';
import { AccountModel, TransactionModel } from '../db';
import { Account, Transaction } from '../types/accounting';
import Decimal from 'decimal.js';

export function useAccounting() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsData, transactionsData] = await Promise.all([
        AccountModel.getAll(),
        TransactionModel.getAll()
      ]);
      
      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Error loading accounting data:', error);
      // Set empty arrays on error to prevent mapping issues
      setAccounts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await TransactionModel.create(transaction);
      
      // Update account balance
      const account = accounts.find(a => a.type === transaction.category);
      if (account) {
        const currentBalance = new Decimal(account.balance);
        const amount = new Decimal(transaction.amount);
        const newBalance = transaction.type === 'CREDIT' 
          ? currentBalance.plus(amount)
          : currentBalance.minus(amount);
        
        await AccountModel.updateBalance(account.id, newBalance.toString());
      }

      await loadData(); // Refresh data
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  return {
    accounts,
    transactions,
    loading,
    createTransaction,
    refresh: loadData
  };
}