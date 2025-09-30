import { Decimal } from 'decimal.js';

export class ColumnNumericTransformer {
  to(data?: number | Decimal): Decimal | null {
    if (data === null || data === undefined) {
      return null;
    }
    return new Decimal(data);
  }

  from(data?: string | null): Decimal | null {
    if (data === null || data === undefined) {
      return null;
    }
    try {
      return new Decimal(data);
    } catch {
      return null;
    }
  }
}
