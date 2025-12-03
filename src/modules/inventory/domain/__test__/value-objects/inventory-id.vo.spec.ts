import { InventoryId } from "../../value-objects/inventory-id.vo";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";

describe("InventoryId Value Object", () => {
  const validUUID = "123e4567-e89b-12d3-a456-426614174000";

  describe("create", () => {
    it("should create InventoryId with valid UUID", () => {
      const inventoryId = InventoryId.create(validUUID);

      expect(inventoryId).toBeInstanceOf(InventoryId);
      expect(inventoryId.getValue()).toBe(validUUID);
    });

    it("should create InventoryId with different valid UUIDs", () => {
      const uuids = [
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      ];

      uuids.forEach((uuid) => {
        const inventoryId = InventoryId.create(uuid);
        expect(inventoryId.getValue()).toBe(uuid);
      });
    });

    it("should throw InvalidInputError for invalid UUID format", () => {
      const invalidUUIDs = [
        "invalid-uuid",
        "123",
        "",
        "123e4567-e89b-12d3-a456", // incomplete
        "123e4567-e89b-12d3-a456-426614174000-extra", // too long
      ];

      invalidUUIDs.forEach((invalidUUID) => {
        expect(() => InventoryId.create(invalidUUID)).toThrow(InvalidInputError);
      });
    });

    it("should throw InvalidInputError for null or undefined", () => {
      expect(() => InventoryId.create(null as unknown as string)).toThrow(
        InvalidInputError,
      );
      expect(() => InventoryId.create(undefined as unknown as string)).toThrow(
        InvalidInputError,
      );
    });
  });

  describe("equals", () => {
    it("should return true for InventoryIds with same value", () => {
      const inventoryId1 = InventoryId.create(validUUID);
      const inventoryId2 = InventoryId.create(validUUID);

      expect(inventoryId1.equals(inventoryId2)).toBe(true);
    });

    it("should return false for InventoryIds with different values", () => {
      const inventoryId1 = InventoryId.create(validUUID);
      const inventoryId2 = InventoryId.create(
        "550e8400-e29b-41d4-a716-446655440000",
      );

      expect(inventoryId1.equals(inventoryId2)).toBe(false);
    });

    it("should throw when comparing with null", () => {
      const inventoryId = InventoryId.create(validUUID);

      // BaseId.equals() does not handle null gracefully, it throws
      expect(() =>
        inventoryId.equals(null as unknown as InventoryId),
      ).toThrow();
    });
  });

  describe("getValue", () => {
    it("should return the UUID string value", () => {
      const inventoryId = InventoryId.create(validUUID);

      expect(inventoryId.getValue()).toBe(validUUID);
      expect(typeof inventoryId.getValue()).toBe("string");
    });
  });
});

