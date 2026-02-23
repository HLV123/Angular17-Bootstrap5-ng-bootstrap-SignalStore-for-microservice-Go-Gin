import { Injectable, signal } from '@angular/core';
import { InvestmentAccount, AccountSummary, Holding, AllocationTarget } from '../models';
import { MOCK_ACCOUNTS, MOCK_ACCOUNT_SUMMARIES, MOCK_HOLDINGS, MOCK_ALLOCATION_TARGETS } from '../mock-data';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  accounts = signal<InvestmentAccount[]>(MOCK_ACCOUNTS);
  summaries = signal<AccountSummary[]>(MOCK_ACCOUNT_SUMMARIES);
  holdings = signal<Holding[]>(MOCK_HOLDINGS);
  allocationTargets = signal<AllocationTarget[]>(MOCK_ALLOCATION_TARGETS);

  getAccountById(id: string): InvestmentAccount | undefined {
    return this.accounts().find(a => a.id === id);
  }

  getSummaryByAccountId(id: string): AccountSummary | undefined {
    return this.summaries().find(s => s.accountId === id);
  }

  getHoldingsByAccountId(id: string): Holding[] {
    return this.holdings().filter(h => h.accountId === id);
  }

  getTotalNAV(): number {
    return this.summaries().reduce((sum, s) => sum + s.nav, 0);
  }

  getTotalDayPnL(): number {
    return this.summaries().reduce((sum, s) => sum + s.dayPnL, 0);
  }

  getTotalUnrealizedPnL(): number {
    return this.summaries().reduce((sum, s) => sum + s.unrealizedPnL, 0);
  }

  getPortfolioAllocation(): { name: string; value: number }[] {
    const sectorMap = new Map<string, number>();
    this.holdings().filter(h => h.accountId === 'acc1').forEach(h => {
      sectorMap.set(h.sector, (sectorMap.get(h.sector) || 0) + h.marketValue);
    });
    const cashBalance = this.summaries().find(s => s.accountId === 'acc1')?.cashBalance || 0;
    const result = Array.from(sectorMap.entries()).map(([name, value]) => ({ name, value }));
    result.push({ name: 'Tiền mặt', value: cashBalance });
    return result;
  }
}
