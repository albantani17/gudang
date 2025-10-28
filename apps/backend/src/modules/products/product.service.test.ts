import { afterAll, describe, expect, it, jest, mock } from "bun:test";
import { productsServices } from "./products.service";

const productMock = {
  code: "PART-1",
  name: "apa aja",
  categoryId: 1,
  unitId: 1,
};

const categoryMock = {
  id: "1",
  name: "Category 1",
};

const unitMock = {
  id: "1",
  name: "Unit 1",
  code: "UNIT-1",
};

mock.module("../../lib/prisma", () => ({
  __esModule: true,
  default: {
    product: {
      create: jest.fn(() => {}),
      findFirst: jest.fn(() => productMock),
    },
    category: {
      findUnique: jest.fn(() => categoryMock),
    },
    unit: {
      findUnique: jest.fn(() => unitMock),
    },
  },
}));

afterAll(() => {
  mock.restore();
});

describe("product service", () => {
  describe("create", () => {
    it("should create a code product", async () => {
      const lastCode = productMock.code.split("-")[1];
      const code = Number(lastCode) + 1;
      const codeFormat = `PART-${code}`;

      expect(codeFormat).toBe("PART-2");
    });

    it("should be create a code product if there is no code product", async () => {
      const lastCode = null;
      const code = lastCode ? Number(lastCode) + 1 : 1;
      const codeFormat = `PART-${code}`;

      expect(codeFormat).toBe("PART-1");
    });
  });
});
