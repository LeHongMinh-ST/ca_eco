import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { ProductCreatedHandler } from "../../events/product-created.handler";
import { InventoryRepositoryToken } from "../../../domain/repositories/inventory.repository.interface";
import { Inventory } from "../../../domain/entities/inventory.entity";
import { InventoryId } from "../../../domain/value-objects/inventory-id.vo";
import { Quantity } from "../../../domain/value-objects/quantity.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";

describe("ProductCreatedHandler", () => {
  let handler: ProductCreatedHandler;
  let mockInventoryRepository: {
    findByProductId: jest.Mock;
    save: jest.Mock;
  };

  const validProductId = "123e4567-e89b-12d3-a456-426614174000";

  beforeAll(() => {
    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    mockInventoryRepository = {
      findByProductId: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCreatedHandler,
        {
          provide: InventoryRepositoryToken,
          useValue: mockInventoryRepository,
        },
      ],
    }).compile();

    handler = module.get<ProductCreatedHandler>(ProductCreatedHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handle", () => {
    it("should skip processing for non-ProductCreated events", async () => {
      const event = {
        name: "SomeOtherEvent",
        occurredAt: new Date(),
      };

      await handler.handle(event);

      expect(mockInventoryRepository.findByProductId).not.toHaveBeenCalled();
      expect(mockInventoryRepository.save).not.toHaveBeenCalled();
    });

    it("should create inventory for new product with productId as string", async () => {
      const event = {
        name: "ProductCreated",
        productId: validProductId,
        occurredAt: new Date(),
      };

      mockInventoryRepository.findByProductId.mockResolvedValue(null);
      mockInventoryRepository.save.mockResolvedValue(undefined);

      await handler.handle(event);

      expect(mockInventoryRepository.findByProductId).toHaveBeenCalledWith(
        expect.any(ProductId),
      );
      expect(mockInventoryRepository.save).toHaveBeenCalledWith(
        expect.any(Inventory),
      );

      // Verify saved inventory has initial quantity of 0
      const savedInventory = mockInventoryRepository.save.mock.calls[0][0];
      expect(savedInventory.getQuantity().getValue()).toBe(0);
    });

    it("should create inventory for new product with productId as value object", async () => {
      const productIdVo = ProductId.create(validProductId);
      const event = {
        name: "ProductCreated",
        productId: productIdVo,
        occurredAt: new Date(),
      };

      mockInventoryRepository.findByProductId.mockResolvedValue(null);
      mockInventoryRepository.save.mockResolvedValue(undefined);

      await handler.handle(event);

      expect(mockInventoryRepository.findByProductId).toHaveBeenCalled();
      expect(mockInventoryRepository.save).toHaveBeenCalled();
    });

    it("should skip creation if inventory already exists for product", async () => {
      const event = {
        name: "ProductCreated",
        productId: validProductId,
        occurredAt: new Date(),
      };

      const existingInventory = Inventory.reconstitute(
        InventoryId.create("550e8400-e29b-41d4-a716-446655440000"),
        ProductId.create(validProductId),
        Quantity.create(100),
      );

      mockInventoryRepository.findByProductId.mockResolvedValue(
        existingInventory,
      );

      await handler.handle(event);

      expect(mockInventoryRepository.findByProductId).toHaveBeenCalled();
      expect(mockInventoryRepository.save).not.toHaveBeenCalled();
    });

    it("should skip processing if productId cannot be extracted", async () => {
      const event = {
        name: "ProductCreated",
        // No productId
        occurredAt: new Date(),
      };

      await handler.handle(event);

      expect(mockInventoryRepository.findByProductId).not.toHaveBeenCalled();
      expect(mockInventoryRepository.save).not.toHaveBeenCalled();
    });

    it("should handle repository errors gracefully without throwing", async () => {
      const event = {
        name: "ProductCreated",
        productId: validProductId,
        occurredAt: new Date(),
      };

      mockInventoryRepository.findByProductId.mockRejectedValue(
        new Error("Database error"),
      );

      // Should not throw
      await expect(handler.handle(event)).resolves.not.toThrow();
    });

    it("should handle save errors gracefully without throwing", async () => {
      const event = {
        name: "ProductCreated",
        productId: validProductId,
        occurredAt: new Date(),
      };

      mockInventoryRepository.findByProductId.mockResolvedValue(null);
      mockInventoryRepository.save.mockRejectedValue(new Error("Save error"));

      // Should not throw
      await expect(handler.handle(event)).resolves.not.toThrow();
    });
  });
});

