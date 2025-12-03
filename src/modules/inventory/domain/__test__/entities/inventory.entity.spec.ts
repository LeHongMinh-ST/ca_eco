import { Inventory } from "../../entities/inventory.entity";
import { InventoryId } from "../../value-objects/inventory-id.vo";
import { Quantity } from "../../value-objects/quantity.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { InvalidInputError } from "src/shared/domain/errors/invalid-input.error";
import { InventoryCreated } from "../../events/inventory-created.event";
import { InventoryIncreased } from "../../events/inventory-increased.event";
import { InventoryDecreased } from "../../events/inventory-decreased.event";
import { InventoryOutOfStock } from "../../events/inventory-out-of-stock.event";
import { InventoryLowStock } from "../../events/inventory-low-stock.event";

describe("Inventory Entity", () => {
  const createInventoryId = () =>
    InventoryId.create("123e4567-e89b-12d3-a456-426614174000");
  const createProductId = () =>
    ProductId.create("550e8400-e29b-41d4-a716-446655440000");
  const createQuantity = (value: number) => Quantity.create(value);

  describe("create", () => {
    it("should create Inventory with valid data", () => {
      const inventoryId = createInventoryId();
      const productId = createProductId();
      const quantity = createQuantity(100);

      const inventory = Inventory.create(inventoryId, productId, quantity);

      expect(inventory).toBeInstanceOf(Inventory);
      expect(inventory.getId().equals(inventoryId)).toBe(true);
      expect(inventory.getProductId().equals(productId)).toBe(true);
      expect(inventory.getQuantity().getValue()).toBe(100);
    });

    it("should set default low stock threshold to 10", () => {
      const inventory = Inventory.create(
        createInventoryId(),
        createProductId(),
        createQuantity(100),
      );

      expect(inventory.getLowStockThreshold()).toBe(10);
    });

    it("should allow custom low stock threshold", () => {
      const inventory = Inventory.create(
        createInventoryId(),
        createProductId(),
        createQuantity(100),
        25,
      );

      expect(inventory.getLowStockThreshold()).toBe(25);
    });

    it("should raise InventoryCreated domain event", () => {
      const inventory = Inventory.create(
        createInventoryId(),
        createProductId(),
        createQuantity(100),
      );

      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InventoryCreated);
      expect((events[0] as InventoryCreated).name).toBe("InventoryCreated");
    });
  });

  describe("reconstitute", () => {
    it("should reconstitute Inventory without raising events", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
        15,
      );

      const events = inventory.pullDomainEvents();

      expect(inventory.getQuantity().getValue()).toBe(50);
      expect(inventory.getLowStockThreshold()).toBe(15);
      expect(events).toHaveLength(0);
    });
  });

  describe("increase", () => {
    it("should increase quantity by specified amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.increase(30);

      expect(inventory.getQuantity().getValue()).toBe(80);
    });

    it("should raise InventoryIncreased event", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.increase(30);
      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InventoryIncreased);
      expect((events[0] as InventoryIncreased).amount).toBe(30);
    });

    it("should throw InvalidInputError for zero amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.increase(0)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for negative amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.increase(-10)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for non-integer amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.increase(10.5)).toThrow(InvalidInputError);
    });
  });

  describe("decrease", () => {
    it("should decrease quantity by specified amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(100),
      );

      inventory.decrease(30);

      expect(inventory.getQuantity().getValue()).toBe(70);
    });

    it("should raise InventoryDecreased event", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(100),
      );

      inventory.decrease(30);
      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InventoryDecreased);
      expect((events[0] as InventoryDecreased).amount).toBe(30);
    });

    it("should raise InventoryOutOfStock event when quantity becomes zero", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.decrease(50);
      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(InventoryDecreased);
      expect(events[1]).toBeInstanceOf(InventoryOutOfStock);
    });

    it("should raise InventoryLowStock event when quantity falls below threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(15),
        10, // threshold
      );

      inventory.decrease(10); // Goes from 15 to 5 (below threshold 10)
      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(2);
      expect(events[0]).toBeInstanceOf(InventoryDecreased);
      expect(events[1]).toBeInstanceOf(InventoryLowStock);
    });

    it("should NOT raise InventoryLowStock if already below threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(5), // Already below threshold
        10,
      );

      inventory.decrease(2); // Goes from 5 to 3
      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InventoryDecreased);
    });

    it("should throw InvalidInputError for insufficient stock", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(20),
      );

      expect(() => inventory.decrease(50)).toThrow(InvalidInputError);
      expect(() => inventory.decrease(50)).toThrow(/Insufficient stock/);
    });

    it("should throw InvalidInputError for zero amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.decrease(0)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for negative amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.decrease(-10)).toThrow(InvalidInputError);
    });

    it("should throw InvalidInputError for non-integer amount", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.decrease(10.5)).toThrow(InvalidInputError);
    });
  });

  describe("updateQuantity", () => {
    it("should update quantity and raise InventoryIncreased event when increasing", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.updateQuantity(createQuantity(80));
      const events = inventory.pullDomainEvents();

      expect(inventory.getQuantity().getValue()).toBe(80);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InventoryIncreased);
    });

    it("should update quantity and raise InventoryDecreased event when decreasing", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.updateQuantity(createQuantity(30));
      const events = inventory.pullDomainEvents();

      expect(inventory.getQuantity().getValue()).toBe(30);
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(InventoryDecreased);
    });

    it("should not raise events when quantity unchanged", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.updateQuantity(createQuantity(50));
      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(0);
    });

    it("should raise InventoryOutOfStock when updating to zero", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.updateQuantity(createQuantity(0));
      const events = inventory.pullDomainEvents();

      expect(events).toHaveLength(2);
      expect(events[1]).toBeInstanceOf(InventoryOutOfStock);
    });
  });

  describe("updateLowStockThreshold", () => {
    it("should update low stock threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
        10,
      );

      inventory.updateLowStockThreshold(20);

      expect(inventory.getLowStockThreshold()).toBe(20);
    });

    it("should allow zero threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      inventory.updateLowStockThreshold(0);

      expect(inventory.getLowStockThreshold()).toBe(0);
    });

    it("should throw InvalidInputError for negative threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.updateLowStockThreshold(-5)).toThrow(
        InvalidInputError,
      );
    });

    it("should throw InvalidInputError for non-integer threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(() => inventory.updateLowStockThreshold(10.5)).toThrow(
        InvalidInputError,
      );
    });
  });

  describe("isAvailable", () => {
    it("should return true when quantity is greater than zero", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(inventory.isAvailable()).toBe(true);
    });

    it("should return false when quantity is zero", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(0),
      );

      expect(inventory.isAvailable()).toBe(false);
    });
  });

  describe("hasStock", () => {
    it("should return true when sufficient stock available", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(inventory.hasStock(30)).toBe(true);
      expect(inventory.hasStock(50)).toBe(true);
    });

    it("should return false when insufficient stock", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(inventory.hasStock(100)).toBe(false);
    });

    it("should return false for zero or negative required quantity", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(inventory.hasStock(0)).toBe(false);
      expect(inventory.hasStock(-10)).toBe(false);
    });

    it("should return false for non-integer required quantity", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(inventory.hasStock(10.5)).toBe(false);
    });
  });

  describe("isLowStock", () => {
    it("should return true when quantity is below threshold but above zero", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(5),
        10,
      );

      expect(inventory.isLowStock()).toBe(true);
    });

    it("should return false when quantity is at or above threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(15),
        10,
      );

      expect(inventory.isLowStock()).toBe(false);
    });

    it("should return false when quantity is exactly at threshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(10),
        10,
      );

      expect(inventory.isLowStock()).toBe(false);
    });

    it("should return false when quantity is zero (out of stock, not low stock)", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(0),
        10,
      );

      expect(inventory.isLowStock()).toBe(false);
    });
  });

  describe("equals", () => {
    it("should return true for inventories with same ID", () => {
      const inventoryId = createInventoryId();
      const inventory1 = Inventory.reconstitute(
        inventoryId,
        createProductId(),
        createQuantity(50),
      );
      const inventory2 = Inventory.reconstitute(
        inventoryId,
        ProductId.create("6ba7b810-9dad-11d1-80b4-00c04fd430c8"),
        createQuantity(100),
      );

      expect(inventory1.equals(inventory2)).toBe(true);
    });

    it("should return false for inventories with different IDs", () => {
      const inventory1 = Inventory.reconstitute(
        InventoryId.create("123e4567-e89b-12d3-a456-426614174000"),
        createProductId(),
        createQuantity(50),
      );
      const inventory2 = Inventory.reconstitute(
        InventoryId.create("550e8400-e29b-41d4-a716-446655440000"),
        createProductId(),
        createQuantity(50),
      );

      expect(inventory1.equals(inventory2)).toBe(false);
    });

    it("should return false when comparing with null", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
      );

      expect(inventory.equals(null as unknown as Inventory)).toBe(false);
    });
  });

  describe("getters", () => {
    it("should return correct productId", () => {
      const productId = createProductId();
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        productId,
        createQuantity(50),
      );

      expect(inventory.getProductId().equals(productId)).toBe(true);
    });

    it("should return correct quantity", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(75),
      );

      expect(inventory.getQuantity().getValue()).toBe(75);
    });

    it("should return correct lowStockThreshold", () => {
      const inventory = Inventory.reconstitute(
        createInventoryId(),
        createProductId(),
        createQuantity(50),
        25,
      );

      expect(inventory.getLowStockThreshold()).toBe(25);
    });
  });
});

