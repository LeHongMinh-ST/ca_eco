# API Examples và Data Mẫu

## Tổng quan

Tài liệu này cung cấp các ví dụ và data mẫu cho tất cả các API endpoints trong hệ thống.

**Base URL**: `http://localhost:3000/api`

**Swagger UI**: `http://localhost:3000/api/docs`

---

## 1. Product API

### 1.1. Tạo sản phẩm mới

**POST** `/products`

**Request:**
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 29990000,
  "image": "https://example.com/images/iphone-15-pro-max.jpg"
}
```

**Response (201):**
```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro Max",
    "price": 29990000,
    "image": "https://example.com/images/iphone-15-pro-max.jpg"
  }'
```

### 1.2. Lấy tất cả sản phẩm

**GET** `/products`

**Response (200):**
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

### 1.3. Lấy sản phẩm theo ID

**GET** `/products/:id`

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "iPhone 15 Pro Max",
  "price": 29990000,
  "image": "https://example.com/images/iphone-15-pro-max.jpg"
}
```

### 1.4. Cập nhật sản phẩm

**PUT** `/products/:id`

**Request:**
```json
{
  "name": "iPhone 15 Pro Max 256GB",
  "price": 30990000,
  "image": "https://example.com/images/iphone-15-pro-max-256gb.jpg"
}
```

### 1.5. Xóa sản phẩm

**DELETE** `/products/:id`

**Response (204):** No content

---

## 2. User API

### 2.1. Tạo user mới

**POST** `/users`

**Request:**
```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!"
}
```

**Response (201):**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "password": "SecurePassword123!"
  }'
```

### 2.2. Lấy user theo ID

**GET** `/users/:id`

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

### 2.3. Lấy user theo email

**GET** `/users/email/:email`

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@example.com",
  "name": "John Doe"
}
```

### 2.4. Cập nhật email

**PUT** `/users/:id/email`

**Request:**
```json
{
  "email": "newemail@example.com"
}
```

### 2.5. Cập nhật tên

**PUT** `/users/:id/name`

**Request:**
```json
{
  "name": "Jane Doe"
}
```

### 2.6. Cập nhật password

**PUT** `/users/:id/password`

**Request:**
```json
{
  "password": "NewSecurePassword123!"
}
```

### 2.7. Xóa user

**DELETE** `/users/:id`

**Response (204):** No content

---

## 3. Cart API

### 3.1. Tạo giỏ hàng mới

**POST** `/carts`

**Request:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response (201):**
```json
{
  "cartId": "443e4567-e89b-12d3-a456-426614174003"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/carts \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### 3.2. Lấy giỏ hàng theo ID

**GET** `/carts/:id`

**Response (200):**
```json
{
  "id": "443e4567-e89b-12d3-a456-426614174003",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "items": [
    {
      "id": "333e4567-e89b-12d3-a456-426614174002",
      "productId": "123e4567-e89b-12d3-a456-426614174000",
      "productName": "iPhone 15 Pro Max",
      "productPrice": 29990000,
      "productImage": "https://example.com/images/iphone-15-pro-max.jpg",
      "quantity": 2,
      "totalPrice": 59980000
    }
  ],
  "totalItemsCount": 2,
  "uniqueItemsCount": 1,
  "totalPrice": 59980000,
  "isEmpty": false
}
```

### 3.3. Lấy giỏ hàng theo User ID

**GET** `/carts/user/:userId`

**Response (200):** Tương tự như GET `/carts/:id`

### 3.4. Thêm sản phẩm vào giỏ hàng

**POST** `/carts/:cartId/items`

**Request:**
```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 2
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/carts/443e4567-e89b-12d3-a456-426614174003/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "123e4567-e89b-12d3-a456-426614174000",
    "quantity": 2
  }'
```

### 3.5. Cập nhật số lượng sản phẩm

**PUT** `/carts/:cartId/items/:itemId`

**Request:**
```json
{
  "quantity": 3
}
```

### 3.6. Xóa sản phẩm khỏi giỏ hàng

**DELETE** `/carts/:cartId/items/:itemId`

**Response (204):** No content

### 3.7. Xóa tất cả sản phẩm trong giỏ hàng

**DELETE** `/carts/:cartId/clear`

**Response (204):** No content

---

## Data Mẫu

### Products

#### Điện thoại
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 29990000,
  "image": "https://example.com/images/iphone-15-pro-max.jpg"
}
```

```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "price": 24990000,
  "image": "https://example.com/images/samsung-galaxy-s24-ultra.jpg"
}
```

#### Laptop
```json
{
  "name": "MacBook Pro 16 inch M3 Max",
  "price": 89990000,
  "image": "https://example.com/images/macbook-pro-16-m3-max.jpg"
}
```

```json
{
  "name": "Dell XPS 15",
  "price": 45990000,
  "image": "https://example.com/images/dell-xps-15.jpg"
}
```

#### Tai nghe
```json
{
  "name": "AirPods Pro 2",
  "price": 6990000,
  "image": "https://example.com/images/airpods-pro-2.jpg"
}
```

### Users

```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!"
}
```

```json
{
  "email": "jane.smith@example.com",
  "name": "Jane Smith",
  "password": "MySecurePass456!"
}
```

### Carts

#### Tạo giỏ hàng
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Thêm sản phẩm vào giỏ hàng
```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantity": 2
}
```

---

## Validation Rules

### Product
- **name**: Required, String, 1-255 characters
- **price**: Required, Number, >= 0
- **image**: Required, String, Valid URL, max 2048 characters

### User
- **email**: Required, Valid email format
- **name**: Required, String, 1-255 characters
- **password**: Required, String, 8-255 characters

### Cart
- **userId**: Required, Valid UUID
- **productId**: Required, Valid UUID
- **quantity**: Required, Integer, >= 1

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "price must be a number",
    "email must be an email"
  ],
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

---

## Swagger Documentation

Truy cập Swagger UI tại: `http://localhost:3000/api/docs`

Tại đây bạn có thể:
- Xem tất cả endpoints với đầy đủ documentation
- Test API trực tiếp trong browser
- Xem request/response schemas
- Xem examples cho mỗi endpoint
- Copy cURL commands

