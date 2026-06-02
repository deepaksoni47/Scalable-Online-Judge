# Authentication API Examples

Base URL: `http://localhost:5000`

## Register

POST `/api/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "user"
}
```

## Login

POST `/api/auth/login`

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

## Profile

GET `/api/auth/profile`

Headers:

```http
Authorization: Bearer <JWT_TOKEN>
```
