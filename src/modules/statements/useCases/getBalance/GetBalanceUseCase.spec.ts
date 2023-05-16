import createRandomStatementOperation from "../../../../shared/factories/statement-operation";
import { createRandomUser } from "../../../../shared/factories/user-factory";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

const user = createRandomUser();
const depositOperation = createRandomStatementOperation(OperationType.DEPOSIT);
const withdrawOperation = createRandomStatementOperation(
  OperationType.WITHDRAW,
  depositOperation.amount - 1
);

describe("Get User's Balance", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
  });

  it("should be able to get the user balance", async () => {
    const { id } = await usersRepository.create(user);

    await statementsRepository.create({
      user_id: id!,
      ...depositOperation,
    });

    await statementsRepository.create({
      user_id: id!,
      ...withdrawOperation,
    });

    const { balance, statement } = await getBalanceUseCase.execute({
      user_id: id!,
    });

    expect(balance).toBe(depositOperation.amount - withdrawOperation.amount);
    expect(statement).toMatchObject([
      {
        id: expect.any(String),
        ...depositOperation,
        user_id: id,
      },
      {
        id: expect.any(String),
        ...withdrawOperation,
        user_id: id,
      },
    ]);
  });

  it("should not be able to get an non-existent user's balance", async () => {
    await expect(
      getBalanceUseCase.execute({ user_id: "fake-user-id" })
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
