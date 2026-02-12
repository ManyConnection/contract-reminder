import { Contract, ContractCategory, BillingCycle } from '../types';

/**
 * Calculate the annual cost for a single contract
 */
export function calculateAnnualCost(contract: Contract): number {
  switch (contract.billingCycle) {
    case 'monthly':
      return contract.amount * 12;
    case 'yearly':
      return contract.amount;
    case 'one-time':
      return 0; // One-time costs are not included in annual calculations
    default:
      return 0;
  }
}

/**
 * Calculate monthly equivalent cost for a contract
 */
export function calculateMonthlyCost(contract: Contract): number {
  switch (contract.billingCycle) {
    case 'monthly':
      return contract.amount;
    case 'yearly':
      return Math.round(contract.amount / 12);
    case 'one-time':
      return 0;
    default:
      return 0;
  }
}

/**
 * Calculate total annual cost for all contracts
 */
export function calculateTotalAnnualCost(contracts: Contract[]): number {
  return contracts.reduce((total, contract) => {
    return total + calculateAnnualCost(contract);
  }, 0);
}

/**
 * Calculate total monthly cost for all contracts
 */
export function calculateTotalMonthlyCost(contracts: Contract[]): number {
  return contracts.reduce((total, contract) => {
    return total + calculateMonthlyCost(contract);
  }, 0);
}

/**
 * Calculate annual cost by category
 */
export function calculateCostByCategory(
  contracts: Contract[]
): Record<ContractCategory, number> {
  const result: Record<ContractCategory, number> = {
    subscription: 0,
    insurance: 0,
    rental: 0,
    other: 0,
  };

  for (const contract of contracts) {
    result[contract.category] += calculateAnnualCost(contract);
  }

  return result;
}

/**
 * Group contracts by category
 */
export function groupByCategory(
  contracts: Contract[]
): Record<ContractCategory, Contract[]> {
  const result: Record<ContractCategory, Contract[]> = {
    subscription: [],
    insurance: [],
    rental: [],
    other: [],
  };

  for (const contract of contracts) {
    result[contract.category].push(contract);
  }

  return result;
}

/**
 * Get contracts with upcoming renewals (within specified days)
 */
export function getUpcomingRenewals(
  contracts: Contract[],
  withinDays: number = 30
): Contract[] {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + withinDays);

  return contracts.filter((contract) => {
    const renewalDate = new Date(contract.renewalDate);
    return renewalDate >= now && renewalDate <= futureDate;
  });
}

/**
 * Sort contracts by renewal date (ascending)
 */
export function sortByRenewalDate(
  contracts: Contract[],
  ascending: boolean = true
): Contract[] {
  return [...contracts].sort((a, b) => {
    const dateA = new Date(a.renewalDate).getTime();
    const dateB = new Date(b.renewalDate).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Sort contracts by amount (descending by annual cost)
 */
export function sortByAmount(contracts: Contract[]): Contract[] {
  return [...contracts].sort((a, b) => {
    return calculateAnnualCost(b) - calculateAnnualCost(a);
  });
}

/**
 * Filter contracts by category
 */
export function filterByCategory(
  contracts: Contract[],
  category: ContractCategory
): Contract[] {
  return contracts.filter((contract) => contract.category === category);
}

/**
 * Search contracts by name
 */
export function searchContracts(
  contracts: Contract[],
  query: string
): Contract[] {
  const lowerQuery = query.toLowerCase();
  return contracts.filter((contract) =>
    contract.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Check if a contract renewal date has passed
 */
export function isRenewalPassed(contract: Contract): boolean {
  return new Date(contract.renewalDate) < new Date();
}

/**
 * Get days until renewal
 */
export function getDaysUntilRenewal(contract: Contract): number {
  const now = new Date();
  const renewalDate = new Date(contract.renewalDate);
  const diffTime = renewalDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
