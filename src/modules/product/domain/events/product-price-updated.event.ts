import { DomainEvent } from "src/shared/domain/interfaces/domain-event.interface";
import { ProductId } from "../value-objects/product-id.vo";
import { ProductPrice } from "../value-objects/product-price.vo";

/**
 * ProductPriceUpdated domain event is raised when product price is changed
 */
export class ProductPriceUpdated implements DomainEvent {
  readonly name = "ProductPriceUpdated";
  readonly occurredAt: Date;
  readonly productId: ProductId;
  readonly oldPrice: ProductPrice;
  readonly newPrice: ProductPrice;

  constructor(
    productId: ProductId,
    oldPrice: ProductPrice,
    newPrice: ProductPrice,
  ) {
    this.productId = productId;
    this.oldPrice = oldPrice;
    this.newPrice = newPrice;
    this.occurredAt = new Date();
  }
}
