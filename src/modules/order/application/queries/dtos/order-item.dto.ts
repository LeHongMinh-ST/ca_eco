import { ApiProperty } from "@nestjs/swagger";
import { OrderItem } from "src/modules/order/domain/value-objects/order-item.vo";

/**
 * OrderItemDto represents order item data for API responses
 */
export class OrderItemDto {
  @ApiProperty({
    example: "product-id-uuid",
    description: "ID of the product",
  })
  readonly productId: string;

  @ApiProperty({
    example: "Sample Product",
    description: "Name of the product",
  })
  readonly productName: string;

  @ApiProperty({
    example: 100.0,
    description: "Price of a single product unit",
  })
  readonly productPrice: number;

  @ApiProperty({
    example: 2,
    description: "Quantity of the product in the order",
  })
  readonly quantity: number;

  @ApiProperty({
    example: 200.0,
    description: "Total price for this order item (price * quantity)",
  })
  readonly totalPrice: number;

  constructor(
    productId: string,
    productName: string,
    productPrice: number,
    quantity: number,
    totalPrice: number,
  ) {
    this.productId = productId;
    this.productName = productName;
    this.productPrice = productPrice;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
  }

  /**
   * Creates OrderItemDto from domain OrderItem
   */
  static fromValueObject(item: OrderItem): OrderItemDto {
    return new OrderItemDto(
      item.getProductId().getValue(),
      item.getProductName(),
      item.getProductPrice(),
      item.getQuantity(),
      item.getTotalPrice(),
    );
  }
}

