import { Injectable, signal } from '@angular/core';
import { Transaction } from '../models';
import { MOCK_TRANSACTIONS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  transactions = signal<Transaction[]>(MOCK_TRANSACTIONS);

  getByAccountId(accountId: string): Transaction[] {
    return this.transactions().filter(t => t.accountId === accountId);
  }

  getBySymbol(symbol: string): Transaction[] {
    return this.transactions().filter(t => t.symbol === symbol);
  }

  addTransaction(t: Omit<Transaction, 'id' | 'createdAt'>): void {
    const newT: Transaction = { ...t, id: 't' + Date.now(), createdAt: new Date().toISOString() } as Transaction;
    this.transactions.update(list => [newT, ...list]);
  }

  deleteTransaction(id: string): void {
    this.transactions.update(list => list.filter(t => t.id !== id));
  }
}
