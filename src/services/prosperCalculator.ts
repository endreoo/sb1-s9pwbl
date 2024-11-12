import Decimal from 'decimal.js';
import { ProsperTarget, ProsperRevenue } from '../types/accounting';

export class ProsperCalculator {
  private targets: ProsperTarget[];

  constructor(targets: ProsperTarget[]) {
    this.targets = targets.sort((a, b) => 
      new Decimal(b.minAmount).minus(new Decimal(a.minAmount)).toNumber()
    );
  }

  calculateCommission(grossAmount: string): {
    commission: string;
    licenseFee: string;
    target: ProsperTarget;
    achieved: boolean;
  } {
    const amount = new Decimal(grossAmount);
    
    // Find applicable target
    const target = this.targets.find(t => 
      amount.greaterThanOrEqualTo(t.minAmount) && t.isActive
    ) || this.targets[this.targets.length - 1];

    const achieved = amount.greaterThanOrEqualTo(target.minAmount);
    
    // Calculate commission
    const commission = amount.times(target.commissionRate / 100);
    
    // License fee is applied if target not met or in addition based on configuration
    const licenseFee = new Decimal(target.licenseFee);

    return {
      commission: commission.toString(),
      licenseFee: licenseFee.toString(),
      target,
      achieved
    };
  }
}