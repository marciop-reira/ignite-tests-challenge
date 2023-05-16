import { createRandomUser } from "../../../../shared/factories/user-factory";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

const user = createRandomUser();

describe("Show User Profile", () => {
  beforeAll(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
  });

  it("should be able to show a user profile", async () => {
    const { id } = await usersRepository.create(user);

    const userProfile = await showUserProfileUseCase.execute(id!);

    expect(userProfile).toMatchObject(user);
  });

  it("should not be able to show an nonexistent user profile", async () => {
    await expect(
      showUserProfileUseCase.execute("fake-user-id")
    ).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
