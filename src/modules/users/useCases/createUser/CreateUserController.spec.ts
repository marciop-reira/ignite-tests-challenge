import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { createRandomUser } from "../../../../shared/factories/user-factory";

let connection: Connection;

const user = createRandomUser();

describe("Create User Controller [POST /api/v1/users]", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(201);
  });

  it("should not be able to create an existing user", async () => {
    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(400);
  });
});
