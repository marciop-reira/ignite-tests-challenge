import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { faker } from "@faker-js/faker";

import { app } from "../../../../app";
import createRandomStatementOperation from "../../../../shared/factories/statement-operation";
import { createRandomUser } from "../../../../shared/factories/user-factory";
import { OperationType, Statement } from "../../entities/Statement";

let connection: Connection;
let token: string;
let createdStatement: Statement;

const user = createRandomUser();
const depositOperation = createRandomStatementOperation(OperationType.DEPOSIT);

describe("Get Balance Controller [GET /api/v1/statements/:statement_id]", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(user);
    const authResponse = await request(app).post("/api/v1/sessions").send(user);

    token = authResponse.body.token;

    const createOperationResponse = await request(app)
      .post("/api/v1/statements/deposit")
      .set({ Authorization: `Bearer ${token}` })
      .send(depositOperation);
    createdStatement = createOperationResponse.body;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a statement operation", async () => {
    const getStatementResponse = await request(app)
      .get(`/api/v1/statements/${createdStatement.id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(getStatementResponse.status).toBe(200);
    expect(getStatementResponse.body).toMatchObject(depositOperation);
  });

  it("should not be able to get a statement operation with invalid token", async () => {
    const getOperationResponse = await request(app)
      .get(`/api/v1/statements/${createdStatement.id}`)
      .set({ Authorization: `invalid-token` });

    expect(getOperationResponse.status).toBe(401);
  });

  it("should not be able to get a non-existent statement operation", async () => {
    const randomStatementId = faker.string.uuid();

    const getOperationResponse = await request(app)
      .get(`/api/v1/statements/${randomStatementId}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(getOperationResponse.status).toBe(404);
  });
});
