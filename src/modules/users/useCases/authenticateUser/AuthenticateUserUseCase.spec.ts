import { hash } from "bcryptjs";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

const user = {
  name: "John Doe",
  email: "john.doe@test.com",
  password: "123"
};

describe("Authenticate User", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  });

  it("should be able to authenticate a user", async () => {
    await usersRepository.create({
      ...user,
      password: await hash(user.password, 8)
    });

    const result = await authenticateUserUseCase.execute({ email: user.email, password: user.password });

    expect(result).toHaveProperty("token");
    expect(result.user).toEqual({
      id: expect.any(String),
      name: user.name,
      email: user.email
    });
  });

  it("should not be able to authenticate a user with wrong email", async () => {
    await expect(authenticateUserUseCase.execute({ 
      email: "wrong@email.com",
      password: user.password 
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate a user with wrong password", async () => {
    await expect(authenticateUserUseCase.execute({ 
      email: user.email,
      password: "invalid-password" 
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});