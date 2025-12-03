# Product API Examples

## Tổng quan

API Product cung cấp các endpoints để quản lý sản phẩm trong hệ thống.

**Base URL**: `http://localhost:3000/api`

## Endpoints

### 1. Tạo sản phẩm mới

**POST** `/products`

**Request Body:**
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 29990000,
  "image": "https://example.com/images/iphone-15-pro-max.jpg"
}
```

**Response (201 Created):**
```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "price": 29990000,
    "image": "https://example.com/images/iphone-15-pro-max.jpg"
  }'
```

### 2. Lấy tất cả sản phẩm

**GET** `/products`

**Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "iPhone 15 Pro Max",
    "price": 29990000,
    "image": "https://example.com/images/iphone-15-pro-max.jpg"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "name": "Samsung Galaxy S24 Ultra",
    "price": 24990000,
    "image": "https://example.com/images/samsung-galaxy-s24-ultra.jpg"
  }
]
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/products
```

### 3. Lấy sản phẩm theo ID

**GET** `/products/:id`

**Path Parameters:**
- `id` (UUID): ID của sản phẩm

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "iPhone 15 Pro Max",
  "price": 29990000,
  "image": "https://example.com/images/iphone-15-pro-max.jpg"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000
```

### 4. Cập nhật sản phẩm

**PUT** `/products/:id`

**Path Parameters:**
- `id` (UUID): ID của sản phẩm

**Request Body (tất cả fields đều optional):**
```json
{
  "name": "iPhone 15 Pro Max 256GB",
  "price": 30990000,
  "image": "https://example.com/images/iphone-15-pro-max-256gb.jpg"
}
```

**Response (200 OK):**
```
(No content)
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max 256GB",
    "price": 30990000,
    "image": "https://example.com/images/iphone-15-pro-max-256gb.jpg"
  }'
```

### 5. Xóa sản phẩm

**DELETE** `/products/:id`

**Path Parameters:**
- `id` (UUID): ID của sản phẩm

**Response (204 No Content):**
```
(No content)
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/products/123e4567-e89b-12d3-a456-426614174000
```

## Data Mẫu

### Sản phẩm điện thoại

```json
{
  "name": "iPhone 15 Pro Max",
  "price": 29990000,
  "image": "https://example.com/images/iphone-15-pro-max.jpg"
}
```

### Sản phẩm laptop

```json
{
  "name": "MacBook Pro 16 inch M3 Max",
  "price": 89990000,
  "image": "https://example.com/images/macbook-pro-16-m3-max.jpg"
}
```

### Sản phẩm tai nghe

```json
{
  "name": "AirPods Pro 2",
  "price": 6990000,
  "image": "https://example.com/images/airpods-pro-2.jpg"
}
```

## Validation Rules

- **name**: 
  - Required
  - String
  - Min length: 1
  - Max length: 255

- **price**: 
  - Required
  - Number
  - Minimum: 0

- **image**: 
  - Required
  - String
  - Valid URL
  - Max length: 2048

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["name must be a string", "price must be a number"],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

## Swagger Documentation

Swagger UI có sẵn tại: `http://localhost:3000/api/docs`

Tại đây bạn có thể:
- Xem tất cả endpoints
- Test API trực tiếp
- Xem request/response schemas
- Xem examples

