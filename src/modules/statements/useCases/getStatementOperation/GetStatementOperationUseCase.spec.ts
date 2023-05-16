import createRandomStatementOperation from "../../../../shared/factories/statement-operation";
import { createRandomUser } from "../../../../shared/factories/user-factory";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;
let createdUser: User;

const user = createRandomUser();
const depositOperation = createRandomStatementOperation(OperationType.DEPOSIT);

describe("Get Statement Operation", () => {
  beforeAll(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );

    createdUser = await usersRepository.create(user);
  });

  it("should be able to get a statement operation", async () => {
    const { id: statement_id } = await statementsRepository.create({
      user_id: createdUser.id!,
      ...depositOperation,
    });

    const operation = await getStatementOperationUseCase.execute({
      user_id: createdUser.id!,
      statement_id: statement_id!,
    });

    expect(operation).toMatchObject(depositOperation);
  });

  it("should not be able to get a non-existent user's statement operation", async () => {
    expect(
      getStatementOperationUseCase.execute({
        user_id: "fake-user-id",
        statement_id: "fake-statement-id",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a non-existent statement operation", async () => {
    expect(
      getStatementOperationUseCase.execute({
        user_id: createdUser.id!,
        statement_id: "fake-statement-id",
      })
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
