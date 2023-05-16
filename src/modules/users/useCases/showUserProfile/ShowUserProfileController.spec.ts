import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";
import { createRandomUser } from "../../../../shared/factories/user-factory";

let connection: Connection;

const user = createRandomUser();

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post("/api/v1/users").send(user);
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show a user profile", async () => {
    const authResponse = await request(app).post("/api/v1/sessions").send(user);
    const { token } = authResponse.body;

    const profileResponse = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body).toEqual({
      id: expect.any(String),
      name: user.name,
      email: user.email,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    });
  });

  it("should not be able to show a user profile with invalid token", async () => {
    const profileResponse = await request(app).get("/api/v1/profile").set({
      Authorization: "invalid-token",
    });

    expect(profileResponse.status).toBe(401);
  });
});
