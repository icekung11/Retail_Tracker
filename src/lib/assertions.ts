import { DatabaseSchema } from './storage';
import { AssertionResult, SingleAssertion } from '@/types';

export function runSafetyAssertions(db: DatabaseSchema): AssertionResult {
  const assertions: SingleAssertion[] = [];

  // Assertion 1: Inventory Non-Negative Guard
  const negativeStockProducts = db.products.filter(p => p.stock < 0);
  const stockPassed = negativeStockProducts.length === 0;
  assertions.push({
    id: 'assert-stock-non-negative',
    name: 'Inventory Safety (stock >= 0)',
    description: 'Ensures no product stock level ever drops below zero after a return or exchange.',
    passed: stockPassed,
    details: stockPassed
      ? `All ${db.products.length} products have valid non-negative inventory.`
      : `FAILED: Products with negative stock: ${negativeStockProducts.map(p => `${p.name} (${p.stock})`).join(', ')}`
  });

  // Assertion 2: Refund Amount Upper Bound Guard
  let refundCapFailedCount = 0;
  db.returns.forEach(r => {
    // Standard return check: refund cannot exceed original unitPrice * qty
    if (r.type === 'return') {
      const maxAllowedRefund = Math.round(r.unitPrice * r.qty * 100) / 100;
      if (r.refundAmount > maxAllowedRefund + 0.01) {
        refundCapFailedCount++;
      }
    }
  });

  const refundPassed = refundCapFailedCount === 0;
  assertions.push({
    id: 'assert-refund-cap',
    name: 'Refund Price Cap Guard',
    description: 'Guarantees refund amount never exceeds original item unit price multiplied by quantity.',
    passed: refundPassed,
    details: refundPassed
      ? `All ${db.returns.length} return records strictly respect maximum refund caps.`
      : `FAILED: Found ${refundCapFailedCount} transactions exceeding max refund allowance.`
  });

  // Assertion 3: Restock Policy Sanity Audit
  const restockAuditFailedCount = db.returns.filter(r => {
    // If defective or damaged, restock should ideally be false unless explicitly audited
    if ((r.reason === 'defective' || r.reason === 'damaged') && r.restock === true && !r.notes) {
      return true;
    }
    return false;
  }).length;

  const restockPassed = restockAuditFailedCount === 0;
  assertions.push({
    id: 'assert-restock-audit',
    name: 'Quarantine Restock Policy Compliance',
    description: 'Flags defective/damaged items restocked without mandatory staff audit notes.',
    passed: restockPassed,
    details: restockPassed
      ? `Restock audit passed. All quarantined items follow store safety policy.`
      : `WARNING: ${restockAuditFailedCount} defective items restocked without audit notes.`
  });

  const allPassed = assertions.every(a => a.passed);

  return {
    timestamp: new Date().toISOString(),
    allPassed,
    assertions
  };
}
