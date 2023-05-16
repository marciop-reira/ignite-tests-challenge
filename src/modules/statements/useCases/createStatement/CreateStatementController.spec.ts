import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import createRandomStatementOperation from "../../../../shared/factories/statement-operation";
import { createRandomUser } from "../../../../shared/factories/user-factory";
import { OperationType } from "../../entities/Statement";

let connection: Connection;
let token: string;

const user = createRandomUser();
const operation = createRandomStatementOperation(OperationType.DEPOSIT);

describe("Create Statement Controller", () => {
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

  it("should be able to create a deposit operation", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send(operation);

    expect(depositResponse.status).toBe(201);
    expect(depositResponse.body).toMatchObject(operation);
  });

  it("should be able to create a withdraw operation", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send(operation);

    expect(depositResponse.status).toBe(201);
  });

  it("should not be able to create a statement with invalid token", async () => {
    const depositResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `invalid-token`,
      })
      .send(operation);

    expect(depositResponse.status).toBe(401);
  });

  it("should not be able to create a withdraw operation when balance is less than operation amount", async () => {
    const operationResponse = await request(app)
      .post("/api/v1/statements/withdraw")
      .set({ Authorization: `Bearer ${token}` })
      .send({ ...operation, amount: operation.amount + 1 });

    expect(operationResponse.status).toBe(400);
  });
});
