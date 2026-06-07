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

# Problem API Examples

Base URL: `http://localhost:5000`

Admin-only routes require an admin JWT:

```http
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: application/json
```

## Create Problem

POST `/api/problems`

```json
{
  "title": "Two Sum",
  "statement": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
  "inputFormat": "First line contains n and target. Second line contains n integers.",
  "outputFormat": "Print two indices.",
  "constraints": "2 <= nums.length <= 10000",
  "difficulty": "Easy",
  "tags": ["array", "hash-table"],
  "examples": [
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "nums[0] + nums[1] equals 9."
    }
  ],
  "isPublished": true
}
```

## Get Problems

GET `/api/problems?page=1&limit=10&search=sum&difficulty=Easy&tags=array,hash-table`

Public endpoint. Returns only published problems.

## Get Problem By ID

GET `/api/problems/<PROBLEM_ID>`

Public endpoint. Returns complete published problem details with `createdBy`.

## Update Problem

PUT `/api/problems/<PROBLEM_ID>`

```json
{
  "title": "Two Sum Updated",
  "statement": "Given nums and target, return indices of two values that add up to target.",
  "difficulty": "Medium",
  "tags": ["array", "hash-table"],
  "isPublished": true
}
```

## Delete Problem

DELETE `/api/problems/<PROBLEM_ID>`

Headers:

```http
Authorization: Bearer <ADMIN_JWT_TOKEN>
```

# Compiler API Examples

POST `/api/compiler/run`

## C++ Hello World

```json
{
  "language": "cpp",
  "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << \"Hello World\" << endl;\n  return 0;\n}",
  "input": ""
}
```

## Python Hello World

```json
{
  "language": "python",
  "code": "print(\"Hello World\")",
  "input": ""
}
```

## Java Hello World

```json
{
  "language": "java",
  "code": "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello World\");\n  }\n}",
  "input": ""
}
```

## C++ With Input

```json
{
  "language": "cpp",
  "code": "#include <iostream>\nusing namespace std;\n\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << a + b;\n  return 0;\n}",
  "input": "5 10"
}
```

## Python With Input

```json
{
  "language": "python",
  "code": "name = input()\nprint(\"Hello\", name)",
  "input": "Deepak"
}
```

## Java With Input

```json
{
  "language": "java",
  "code": "public class Main {\n  public static void main(String[] args) {\n    java.util.Scanner scanner = new java.util.Scanner(System.in);\n    int a = scanner.nextInt();\n    int b = scanner.nextInt();\n    System.out.println(a + b);\n  }\n}",
  "input": "5\n10"
}
```

## Compilation Error

```json
{
  "language": "cpp",
  "code": "#include <iostream>\nint main() {\n  std::cout << \"Missing semicolon\"\n}",
  "input": ""
}
```

## Runtime Error

```json
{
  "language": "python",
  "code": "print(10 / 0)",
  "input": ""
}
```

## Empty Code

```json
{
  "language": "python",
  "code": "",
  "input": ""
}
```

## Invalid Language

```json
{
  "language": "javascript",
  "code": "console.log('Hello World')",
  "input": ""
}
```
