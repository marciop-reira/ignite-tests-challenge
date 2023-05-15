import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let createdUser: User;

const user = {
  name: "John Doe",
  email: "john.doe@gmail.com",
  password: "123",
};

const statement = {
  type: OperationType.DEPOSIT,
  amount: 100,
  description: "Test operation"
};

describe("Create Statement", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);

    createdUser = await usersRepository.create(user);
  });

  it("should be able to create a statement", async () => {
    const statementOperation = await createStatementUseCase.execute({
      user_id: createdUser.id!,
      ...statement
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toMatchObject({ ...statement, user_id: createdUser.id });
  });

  it("should not be able to create a statement for an non-existing user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "fake-user-id",
        ...statement
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a statement when balance is less than operation amount", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: createdUser.id!,
        type: OperationType.WITHDRAW,
        amount: 201,
        description: "Test description"
      })
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});