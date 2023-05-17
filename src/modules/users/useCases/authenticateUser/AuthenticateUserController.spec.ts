import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { createRandomUser } from "../../../../shared/factories/user-factory";

let connection: Connection;

const user = createRandomUser();

describe("Authenticate User Controller [POST /api/v1/sessions]", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send(user);

    expect(authResponse.status).toBe(200);
    expect(authResponse.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a user with wrong email", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: "wrong@email.com", password: user.password });

    expect(authResponse.status).toBe(401);
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    const authResponse = await request(app)
      .post("/api/v1/sessions")
      .send({ email: user.email, password: "wrong-password" });

    expect(authResponse.status).toBe(401);
  });
});
