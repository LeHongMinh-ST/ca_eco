import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { ProductId } from "../value-objects/product-id.vo";

/**
 * ProductCreated domain event is raised when a new product is created
 */
export class ProductCreated implements DomainEvent {
  readonly name = "ProductCreated";
  readonly occurredAt: Date;
  readonly productId: ProductId;

  constructor(productId: ProductId) {
    this.productId = productId;
    this.occurredAt = new Date();
  }
}
