import { faker } from "@faker-js/faker";

export function createRandomUser() {
  return {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };
}
