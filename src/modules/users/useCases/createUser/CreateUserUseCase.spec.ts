import { compare } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { CreateUserError } from "./CreateUserError";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

const user = {
  name: "Test",
  email: "test@example.com",
  password: "123"
};

describe("Create User", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });
  
  it("should be able to create a user", async () => {
    await createUserUseCase.execute(user);
    const { password, ...userWithoutPassword } = user;

    const createdUser = await usersRepository.findByEmail(user.email);

    expect(createdUser).toHaveProperty("id");
    expect(createdUser).toMatchObject(userWithoutPassword);
    expect(createdUser!.password !== password).toBeTruthy();
    expect(compare(password, createdUser!.password)).toBeTruthy();
  });

  it("should not be able to create an existing user", async () => {
    await expect(createUserUseCase.execute(user)).rejects.toBeInstanceOf(CreateUserError);
  });
});