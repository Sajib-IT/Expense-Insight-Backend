# Expense Insight API Documentation

> **Base URL:** `http://localhost:5000/api/v1`  
> **Stack:** Express 5 + Prisma + Neon DB (PostgreSQL) + Gemini AI  
> **Auth:** JWT Bearer token — `Authorization: Bearer <accessToken>`

---

## Table of Contents

- [Health Check](#health-check)
- [Auth](#auth)
- [User](#user)
- [Categories](#categories)
- [Expenses](#expenses)
- [Budgets](#budgets)
- [Dashboard](#dashboard)
- [AI Extract](#ai-extract)
- [Data Models](#data-models)
- [Response Shapes](#response-shapes)

---

## Health Check

### `GET /health`

> Public — no auth required

**Response `200`:**

```json
{
  "success": true,
  "message": "Expense Insight API is running",
  "timestamp": "2026-05-05T12:00:00.000Z"
}
```

---

## Auth

### `POST /api/v1/auth/register`

> Public

**Body:**

```json
{
  "name": "John Doe",          // required
  "email": "john@example.com", // required, valid email
  "password": "password123"    // required, min 6 chars
}
```

**Response `201`:** `{ id, name, email, isVerified, createdAt }`

> Sends a verification email.

---

### `POST /api/v1/auth/login`

> Public

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response `200`:**

```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": { "id": "...", "name": "...", "email": "...", "isVerified": true }
}
```

---

### `GET /api/v1/auth/verify-email/:token`

> Public

| Param   | Type   | Description                       |
| ------- | ------ | --------------------------------- |
| `token` | string | Verification token from the email |

**Response `200`:** `{ "message": "Email verified successfully" }`

---

### `POST /api/v1/auth/forgot-password`

> Public

**Body:**

```json
{ "email": "john@example.com" }
```

**Response `200`:** `{ "message": "If the email exists, a reset link has been sent" }`

---

### `POST /api/v1/auth/reset-password`

> Public

**Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123"  // min 6 chars
}
```

**Response `200`:** `{ "message": "Password reset successfully" }`

---

### `POST /api/v1/auth/change-password`

> **Auth required**

**Body:**

```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"  // min 6 chars
}
```

**Response `200`:** `{ "message": "Password changed successfully" }`

---

### `POST /api/v1/auth/refresh-token`

> Public

**Body:**

```json
{ "refreshToken": "eyJhbG..." }
```

**Response `200`:** `{ "accessToken": "new-eyJhbG..." }`

---

## User

### `GET /api/v1/users/profile`

> **Auth required**

**Response `200`:** `{ id, name, email, avatar, isVerified, createdAt, updatedAt }`

---

### `PATCH /api/v1/users/profile`

> **Auth required**

**Body:**

```json
{
  "name": "John Updated",                // optional
  "avatar": "https://example.com/pic.png" // optional
}
```

**Response `200`:** Updated user object.

---

## Categories

### `POST /api/v1/categories`

> **Auth required**

**Body:**

```json
{
  "name": "Food",       // required
  "type": "EXPENSE",    // required: INCOME | EXPENSE
  "icon": "🍔",         // optional
  "colour": "#FF5733"   // optional
}
```

---

### `GET /api/v1/categories`

> **Auth required**

| Query   | Type   | Description                      |
| ------- | ------ | -------------------------------- |
| `type`  | string | Optional: `INCOME` or `EXPENSE`  |

---

### `GET /api/v1/categories/:id`

> **Auth required**

| Param | Type | Description |
| ----- | ---- | ----------- |
| `id`  | UUID | Category ID |

---

### `PATCH /api/v1/categories/:id`

> **Auth required**

**Body (all optional):**

```json
{
  "name": "Groceries",
  "type": "EXPENSE",
  "icon": "🛒",
  "colour": "#28A745"
}
```

> Default categories cannot be modified.

---

### `DELETE /api/v1/categories/:id`

> **Auth required**

> Cannot delete default categories or categories with existing expenses.

---

## Expenses

### `POST /api/v1/expenses`

> **Auth required**

**Body:**

```json
{
  "amount": 29.99,                // required, positive number
  "description": "Weekly groceries", // optional
  "date": "2026-05-05",           // required, ISO date
  "type": "EXPENSE",              // default: EXPENSE
  "categoryId": "uuid"            // required
}
```

---

### `GET /api/v1/expenses`

> **Auth required**

| Query        | Type   | Default   | Description                    |
| ------------ | ------ | --------- | ------------------------------ |
| `page`       | string | 1         | Page number                    |
| `limit`      | string | 10        | Items per page                 |
| `sortBy`     | string | createdAt | Sort field                     |
| `sortOrder`  | string | desc      | `asc` or `desc`                |
| `type`       | string | —         | `INCOME` or `EXPENSE`          |
| `categoryId` | string | —         | Filter by category UUID        |
| `startDate`  | string | —         | ISO date — range start         |
| `endDate`    | string | —         | ISO date — range end           |
| `searchTerm` | string | —         | Search in description          |

**Response includes:** `meta: { page, limit, total, totalPages }`

---

### `GET /api/v1/expenses/:id`

> **Auth required**

---

### `PATCH /api/v1/expenses/:id`

> **Auth required**

**Body (all optional):**

```json
{
  "amount": 35.00,
  "description": "Updated",
  "date": "2026-05-06",
  "type": "EXPENSE",
  "categoryId": "uuid"
}
```

---

### `DELETE /api/v1/expenses/:id`

> **Auth required**

---

## Budgets

### `POST /api/v1/budgets`

> **Auth required**

**Body:**

```json
{
  "amount": 500.00,       // required, positive
  "month": 5,             // required, 1-12
  "year": 2026,           // required, 2000-2100
  "categoryId": "uuid"    // required
}
```

> One budget per `[month, year, categoryId]` per user.

---

### `GET /api/v1/budgets`

> **Auth required**

| Query   | Type   | Description           |
| ------- | ------ | --------------------- |
| `month` | string | Filter by month (1-12)|
| `year`  | string | Filter by year        |

**Response includes computed fields:** `spent`, `remaining`, `percentage`

---

### `GET /api/v1/budgets/:id`

> **Auth required**

---

### `PATCH /api/v1/budgets/:id`

> **Auth required**

**Body:**

```json
{ "amount": 600.00 }
```

---

### `DELETE /api/v1/budgets/:id`

> **Auth required**

---

## Dashboard

### `GET /api/v1/dashboard`

> **Auth required**

| Query   | Type   | Default        |
| ------- | ------ | -------------- |
| `month` | string | Current month  |
| `year`  | string | Current year   |

**Response `200`:**

```json
{
  "period": { "month": 5, "year": 2026 },
  "summary": {
    "totalIncome": 3000,
    "totalExpenses": 1250.50,
    "balance": 1749.50,
    "transactionCount": 42
  },
  "categoryBreakdown": [
    {
      "categoryId": "...",
      "categoryName": "Food",
      "categoryColour": "#FF5733",
      "categoryIcon": "🍔",
      "total": 450,
      "count": 15,
      "percentage": 36
    }
  ],
  "budgetOverview": [
    {
      "id": "...",
      "categoryName": "Food",
      "budgetAmount": 500,
      "spent": 450,
      "remaining": 50,
      "percentage": 90
    }
  ],
  "recentTransactions": [ /* last 10 expenses with category */ ]
}
```

---

## AI Extract

### `POST /api/v1/ai-extract/receipt`

> **Auth required**

**Body:** `multipart/form-data`

| Field     | Type | Notes                                 |
| --------- | ---- | ------------------------------------- |
| `receipt` | File | JPEG, PNG, WebP, HEIC — max 10 MB    |

**Response `200`:**

```json
{
  "amount": 12.50,
  "description": "Lunch",
  "date": "2026-05-05",
  "type": "EXPENSE",
  "category": "Food",
  "merchant": "Tesco",
  "currency": "GBP",
  "items": [{ "name": "Meal deal", "quantity": 1, "price": 12.50 }],
  "confidence": 0.95
}
```

---

### `POST /api/v1/ai-extract/text`

> **Auth required**

**Body:**

```json
{
  "text": "Spent £12.50 at Tesco for lunch yesterday"  // required, min 3 chars
}
```

**Response `200`:** Same shape as receipt extraction above.

---

## Data Models

### Enum: TransactionType

| Value     |
| --------- |
| `INCOME`  |
| `EXPENSE` |

### User

| Field               | Type      | Notes              |
| ------------------- | --------- | ------------------ |
| `id`                | UUID      | Primary key        |
| `email`             | String    | Unique             |
| `password`          | String    | Hashed (bcrypt)    |
| `name`              | String    |                    |
| `avatar`            | String?   | Optional           |
| `isVerified`        | Boolean   | Default `false`    |
| `verificationToken` | String?   |                    |
| `resetToken`        | String?   |                    |
| `resetTokenExpiry`  | DateTime? |                    |
| `createdAt`         | DateTime  | Auto               |
| `updatedAt`         | DateTime  | Auto               |

### Category

| Field       | Type            | Notes           |
| ----------- | --------------- | --------------- |
| `id`        | UUID            | Primary key     |
| `name`      | String          | Unique per user |
| `type`      | TransactionType |                 |
| `icon`      | String?         | Optional        |
| `colour`    | String?         | Optional        |
| `isDefault` | Boolean         | Default `false` |
| `userId`    | UUID            | FK → User       |
| `createdAt` | DateTime        | Auto            |
| `updatedAt` | DateTime        | Auto            |

### Expense

| Field        | Type            | Notes           |
| ------------ | --------------- | --------------- |
| `id`         | UUID            | Primary key     |
| `amount`     | Float           |                 |
| `description`| String?         | Optional        |
| `date`       | DateTime        |                 |
| `type`       | TransactionType | Default EXPENSE |
| `receiptUrl` | String?         | Optional        |
| `categoryId` | UUID            | FK → Category   |
| `userId`     | UUID            | FK → User       |
| `createdAt`  | DateTime        | Auto            |
| `updatedAt`  | DateTime        | Auto            |

### Budget

| Field        | Type     | Notes                                         |
| ------------ | -------- | --------------------------------------------- |
| `id`         | UUID     | Primary key                                   |
| `amount`     | Float    | Budget limit                                  |
| `spent`      | Float    | Default 0                                     |
| `month`      | Int      | 1–12                                          |
| `year`       | Int      |                                               |
| `categoryId` | UUID     | FK → Category                                 |
| `userId`     | UUID     | FK → User                                     |
| `createdAt`  | DateTime | Auto                                          |
| `updatedAt`  | DateTime | Auto                                          |
|              |          | **Unique:** `[month, year, categoryId, userId]`|

---

## Response Shapes

### Success

```json
{
  "success": true,
  "message": "...",
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 },
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "...",
  "errorMessages": [{ "path": "email", "message": "Invalid email address" }],
  "stack": "... (development only)"
}
```

---

**Total: 27 endpoints** | Express + Prisma + Neon DB + Gemini AI
