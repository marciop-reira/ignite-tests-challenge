import { faker } from "@faker-js/faker";

import { OperationType } from "../../modules/statements/entities/Statement";

export default function createRandomStatementOperation(
  type: OperationType,
  amount?: number
) {
  return {
    type,
    amount:
      amount || faker.number.float({ min: 10, max: 5000, precision: 0.01 }),
    description: faker.finance.transactionDescription(),
  };
}
