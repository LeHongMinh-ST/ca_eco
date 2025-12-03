import { Quantity } from "../../value-objects/quantity.vo";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";

describe("Quantity Value Object", () => {
  describe("create", () => {
    it("should create Quantity with valid positive integer", () => {
      const quantity = Quantity.create(100);

      expect(quantity).toBeInstanceOf(Quantity);
      expect(quantity.getValue()).toBe(100);
    });

    it("should create Quantity with zero", () => {
      const quantity = Quantity.create(0);

      expect(quantity.getValue()).toBe(0);
    });

    it("should create Quantity with large numbers", () => {
      const largeNumber = 1000000;
      const quantity = Quantity.create(largeNumber);

      expect(quantity.getValue()).toBe(largeNumber);
    });

    it("should throw InvalidInputError for negative numbers", () => {
      expect(() => Quantity.create(-1)).toThrow(InvalidInputError);
      expect(() => Quantity.create(-100)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for decimal numbers", () => {
      expect(() => Quantity.create(10.5)).toThrow(InvalidInputError);
      expect(() => Quantity.create(0.1)).toThrow(InvalidInputError);
      expect(() => Quantity.create(99.99)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for NaN", () => {
      expect(() => Quantity.create(NaN)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for Infinity", () => {
      expect(() => Quantity.create(Infinity)).toThrow(InvalidInputError);
      expect(() => Quantity.create(-Infinity)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for non-number types", () => {
      expect(() => Quantity.create("10" as unknown as number)).toThrow(
        InvalidInputError,
      );
      expect(() => Quantity.create(null as unknown as number)).toThrow(
        InvalidInputError,
      );
      expect(() => Quantity.create(undefined as unknown as number)).toThrow(
        InvalidInputError,
      );
    });
  });

  describe("value comparison", () => {
    it("should have same value for Quantities created with same number", () => {
      const quantity1 = Quantity.create(50);
      const quantity2 = Quantity.create(50);

      expect(quantity1.getValue()).toBe(quantity2.getValue());
    });

    it("should have different values for Quantities created with different numbers", () => {
      const quantity1 = Quantity.create(50);
      const quantity2 = Quantity.create(100);

      expect(quantity1.getValue()).not.toBe(quantity2.getValue());
    });

    it("should correctly compare zero quantities", () => {
      const quantity1 = Quantity.create(0);
      const quantity2 = Quantity.create(0);

      expect(quantity1.getValue()).toBe(quantity2.getValue());
    });
  });

  describe("getValue", () => {
    it("should return the numeric value", () => {
      const quantity = Quantity.create(75);

      expect(quantity.getValue()).toBe(75);
      expect(typeof quantity.getValue()).toBe("number");
    });
  });
});

