import { resetDB } from "@/lib/db/reset";

beforeEach(async () => {
  await resetDB();
});

vi.mock("server-only", () => {
  return {};
});

vi.mock(import("react"), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    cache: (x) => x,
  };
});
