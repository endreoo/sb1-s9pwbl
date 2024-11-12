import { useState, useEffect } from 'react';
import { VirtualCardModel } from '../db';
import { VirtualCard } from '../types/accounting';
import Decimal from 'decimal.js';

export function useVirtualCards() {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const cardsData = VirtualCardModel.getAll();
      setCards(cardsData);
    } catch (error) {
      console.error('Error loading virtual cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (card: Omit<VirtualCard, 'id' | 'lastUsed' | 'createdAt'>) => {
    try {
      const newCard = VirtualCardModel.create(card);
      await loadCards();
      return newCard;
    } catch (error) {
      console.error('Error creating virtual card:', error);
      throw error;
    }
  };

  const updateCardBalance = async (cardId: number, amount: string, isDebit: boolean) => {
    try {
      const card = cards.find(c => c.id === cardId);
      if (!card) throw new Error('Card not found');

      const currentBalance = new Decimal(card.balance);
      const transactionAmount = new Decimal(amount);
      const newBalance = isDebit 
        ? currentBalance.minus(transactionAmount)
        : currentBalance.plus(transactionAmount);

      if (newBalance.isNegative()) {
        throw new Error('Insufficient funds');
      }

      VirtualCardModel.updateBalance(cardId, newBalance.toString());
      await loadCards();
    } catch (error) {
      console.error('Error updating card balance:', error);
      throw error;
    }
  };

  return {
    cards,
    loading,
    createCard,
    updateCardBalance,
    refresh: loadCards
  };
}