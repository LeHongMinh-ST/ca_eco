import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { OrderCreatedHandler } from "../../events/order-created.handler";
import { InventoryRepositoryToken } from "../../../domain/repositories/inventory.repository.interface";
import { DomainEventDispatcherToken } from "src/shared/application/events/domain-event-dispatcher.interface";
import { Inventory } from "../../../domain/entities/inventory.entity";
import { InventoryId } from "../../../domain/value-objects/inventory-id.vo";
import { Quantity } from "../../../domain/value-objects/quantity.vo";
import { ProductId } from "src/modules/product/domain/value-objects/product-id.vo";
import { OrderId } from "src/modules/order/domain/value-objects/order-id.vo";
import { OrderConfirmed } from "src/modules/order/domain/events/order-confirmed.event";
import { OrderFailed } from "src/modules/order/domain/events/order-failed.event";

describe("OrderCreatedHandler", () => {
  let handler: OrderCreatedHandler;
  let mockInventoryRepository: {
    findByProductId: jest.Mock;
    save: jest.Mock;
  };
  let mockEventDispatcher: {
    dispatch: jest.Mock;
  };

  const validOrderId = "123e4567-e89b-12d3-a456-426614174000";
  const validProductId1 = "550e8400-e29b-41d4-a716-446655440000";
  const validProductId2 = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  const validCartId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  const createInventory = (productId: string, quantity: number) =>
    Inventory.reconstitute(
      InventoryId.create(crypto.randomUUID()),
      ProductId.create(productId),
      Quantity.create(quantity),
    );

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

    mockEventDispatcher = {
      dispatch: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderCreatedHandler,
        {
          provide: InventoryRepositoryToken,
          useValue: mockInventoryRepository,
        },
        {
          provide: DomainEventDispatcherToken,
          useValue: mockEventDispatcher,
        },
      ],
    }).compile();

    handler = module.get<OrderCreatedHandler>(OrderCreatedHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handle", () => {
    it("should skip processing for non-OrderCreated events", async () => {
      const event = {
        name: "SomeOtherEvent",
        occurredAt: new Date(),
      };

      await handler.handle(event);

      expect(mockInventoryRepository.findByProductId).not.toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("should dispatch OrderFailed if orderId cannot be extracted", async () => {
      const event = {
        name: "OrderCreated",
        items: [{ productId: validProductId1, quantity: 5 }],
        occurredAt: new Date(),
      };

      await handler.handle(event);

      expect(mockEventDispatcher.dispatch).not.toHaveBeenCalled();
    });

    it("should dispatch OrderFailed if order has no items", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        items: [],
        occurredAt: new Date(),
      };

      await handler.handle(event);

      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderFailed),
      );

      const dispatchedEvent = mockEventDispatcher.dispatch.mock.calls[0][0];
      expect(dispatchedEvent.name).toBe("OrderFailed");
    });

    it("should dispatch OrderFailed if inventory not found for product", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        items: [
          {
            productId: validProductId1,
            productName: "Test Product",
            productPrice: 100,
            quantity: 5,
          },
        ],
        occurredAt: new Date(),
      };

      mockInventoryRepository.findByProductId.mockResolvedValue(null);

      await handler.handle(event);

      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderFailed),
      );

      const dispatchedEvent = mockEventDispatcher.dispatch.mock.calls[0][0];
      expect(dispatchedEvent.reason).toContain("Inventory not found");
    });

    it("should dispatch OrderFailed if insufficient stock", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        items: [
          {
            productId: validProductId1,
            productName: "Test Product",
            productPrice: 100,
            quantity: 50,
          },
        ],
        occurredAt: new Date(),
      };

      const inventory = createInventory(validProductId1, 10); // Only 10 in stock
      mockInventoryRepository.findByProductId.mockResolvedValue(inventory);

      await handler.handle(event);

      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderFailed),
      );

      const dispatchedEvent = mockEventDispatcher.dispatch.mock.calls[0][0];
      expect(dispatchedEvent.reason).toContain("Insufficient stock");
    });

    it("should decrease inventory and dispatch OrderConfirmed on success", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        sourceCartId: validCartId,
        items: [
          {
            productId: validProductId1,
            productName: "Test Product",
            productPrice: 100,
            quantity: 5,
          },
        ],
        occurredAt: new Date(),
      };

      const inventory = createInventory(validProductId1, 100);
      mockInventoryRepository.findByProductId.mockResolvedValue(inventory);
      mockInventoryRepository.save.mockResolvedValue(undefined);

      await handler.handle(event);

      // Verify inventory was saved after decrease
      expect(mockInventoryRepository.save).toHaveBeenCalled();

      // Verify OrderConfirmed was dispatched
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderConfirmed),
      );

      const dispatchedEvent = mockEventDispatcher.dispatch.mock.calls[0][0];
      expect(dispatchedEvent.name).toBe("OrderConfirmed");
      expect(dispatchedEvent.sourceCartId).toBe(validCartId);
    });

    it("should process multiple items and decrease all inventories", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        items: [
          {
            productId: validProductId1,
            productName: "Product 1",
            productPrice: 100,
            quantity: 5,
          },
          {
            productId: validProductId2,
            productName: "Product 2",
            productPrice: 200,
            quantity: 3,
          },
        ],
        occurredAt: new Date(),
      };

      const inventory1 = createInventory(validProductId1, 100);
      const inventory2 = createInventory(validProductId2, 50);

      mockInventoryRepository.findByProductId
        .mockResolvedValueOnce(inventory1) // First call for check
        .mockResolvedValueOnce(inventory2) // Second call for check
        .mockResolvedValueOnce(inventory1) // Third call for decrease
        .mockResolvedValueOnce(inventory2); // Fourth call for decrease

      mockInventoryRepository.save.mockResolvedValue(undefined);

      await handler.handle(event);

      // Should save twice (once for each product)
      expect(mockInventoryRepository.save).toHaveBeenCalledTimes(2);

      // Should dispatch OrderConfirmed
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderConfirmed),
      );
    });

    it("should handle orderId as value object", async () => {
      const orderIdVo = OrderId.create(validOrderId);
      const event = {
        name: "OrderCreated",
        orderId: orderIdVo,
        items: [
          {
            productId: validProductId1,
            productName: "Test Product",
            productPrice: 100,
            quantity: 5,
          },
        ],
        occurredAt: new Date(),
      };

      const inventory = createInventory(validProductId1, 100);
      mockInventoryRepository.findByProductId.mockResolvedValue(inventory);
      mockInventoryRepository.save.mockResolvedValue(undefined);

      await handler.handle(event);

      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderConfirmed),
      );
    });

    it("should dispatch OrderFailed if inventory decrease fails", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        items: [
          {
            productId: validProductId1,
            productName: "Test Product",
            productPrice: 100,
            quantity: 5,
          },
        ],
        occurredAt: new Date(),
      };

      const inventory = createInventory(validProductId1, 100);

      // First call returns inventory for check, second returns null for decrease
      mockInventoryRepository.findByProductId
        .mockResolvedValueOnce(inventory)
        .mockResolvedValueOnce(null);

      await handler.handle(event);

      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderFailed),
      );

      const dispatchedEvent = mockEventDispatcher.dispatch.mock.calls[0][0];
      expect(dispatchedEvent.reason).toContain("Inventory decrease failed");
    });

    it("should handle repository errors gracefully", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        items: [
          {
            productId: validProductId1,
            productName: "Test Product",
            productPrice: 100,
            quantity: 5,
          },
        ],
        occurredAt: new Date(),
      };

      mockInventoryRepository.findByProductId.mockRejectedValue(
        new Error("Database error"),
      );

      // Should not throw
      await expect(handler.handle(event)).resolves.not.toThrow();

      // Should try to dispatch OrderFailed
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderFailed),
      );
    });

    it("should handle save errors and dispatch OrderFailed", async () => {
      const event = {
        name: "OrderCreated",
        orderId: validOrderId,
        items: [
          {
            productId: validProductId1,
            productName: "Test Product",
            productPrice: 100,
            quantity: 5,
          },
        ],
        occurredAt: new Date(),
      };

      const inventory = createInventory(validProductId1, 100);
      mockInventoryRepository.findByProductId.mockResolvedValue(inventory);
      mockInventoryRepository.save.mockRejectedValue(new Error("Save error"));

      await handler.handle(event);

      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith(
        expect.any(OrderFailed),
      );
    });
  });
});

