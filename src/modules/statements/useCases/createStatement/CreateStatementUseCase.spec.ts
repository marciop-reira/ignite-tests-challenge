import createRandomStatementOperation from "../../../../shared/factories/statement-operation";
import { createRandomUser } from "../../../../shared/factories/user-factory";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createdUser: User;

const user = createRandomUser();
const depositOperation = createRandomStatementOperation(OperationType.DEPOSIT);
const withdrawOperation = createRandomStatementOperation(
  OperationType.WITHDRAW,
  depositOperation.amount - 1
);

describe("Create Statement", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );

    createdUser = await usersRepository.create(user);
  });

  it("should be able to create a deposit operation", async () => {
    const statementOperation = await createStatementUseCase.execute({
      user_id: createdUser.id!,
      ...depositOperation,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toMatchObject({
      ...depositOperation,
      user_id: createdUser.id,
    });
  });

  it("should be able to create a withdraw operation", async () => {
    const statementOperation = await createStatementUseCase.execute({
      user_id: createdUser.id!,
      ...withdrawOperation,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toMatchObject({
      ...withdrawOperation,
      user_id: createdUser.id,
    });
  });

  it("should not be able to create a statement for an non-existing user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "fake-user-id",
        ...depositOperation,
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a withdraw operation when balance is less than operation amount", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: createdUser.id!,
        type: OperationType.WITHDRAW,
        amount: depositOperation.amount + 1,
        description: "Test description",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
