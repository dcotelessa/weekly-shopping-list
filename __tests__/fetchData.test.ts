// tests/fetchData.test.ts
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "bun:test";
import fetchMock from "fetch-mock";
import { fetchData } from "@/app/lib/fetchData";

// Define the type of data you expect
interface ApiResponse {
  message: string;
}

beforeAll(() => {
  // Global setup if needed
});

afterAll(() => {
  // Global teardown if needed
  fetchMock.restore();
});

beforeEach(() => {
  fetchMock.restore(); // Reset mocks before each test
});

describe("fetchData", () => {
  // it("should fetch data from the api", async () => {
  //   const data = await fetchdata<apiresponse>("https://api.example.com/data");
  //   expect(data).toequal({ message: "hello, world!" });
  // });

  it("should throw an error if the network response is not ok", async () => {
    fetchMock.mock("https://api.example.com/data", 500);

    await expect(
      fetchData<ApiResponse>("https://api.example.com/data"),
    ).rejects.toThrow("Network response was not ok");

    fetchMock.restore();
    fetchMock.mock("https://api.example.com/data", {
      message: "Hello, world!",
    });
  });
});
