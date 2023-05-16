import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import createRandomStatementOperation from "../../../../shared/factories/statement-operation";
import { createRandomUser } from "../../../../shared/factories/user-factory";
import { OperationType } from "../../entities/Statement";

let connection: Connection;
let token: string;

const user = createRandomUser();
const depositOperation = createRandomStatementOperation(OperationType.DEPOSIT);
const withdrawOperation = createRandomStatementOperation(
  OperationType.WITHDRAW,
  depositOperation.amount - 1.15
);

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(user);
    const authResponse = await request(app).post("/api/v1/sessions").send(user);

    token = authResponse.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a user's balance", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send(depositOperation);

    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send(withdrawOperation);

    const getResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `Bearer ${token}` });

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.statement.length).toBe(2);
    expect(getResponse.body.balance).toBe(
      depositOperation.amount - withdrawOperation.amount
    );
  });

  it("should not be able to get a user's balance with invalid token", async () => {
    const getResponse = await request(app)
      .get("/api/v1/statements/balance")
      .set({ Authorization: `invalid-token` });

    expect(getResponse.status).toBe(401);
  });
});
