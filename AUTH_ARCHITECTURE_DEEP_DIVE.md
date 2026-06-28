# QuickPed Authentication & Authorization Architecture Deep Dive

Welcome to the QuickPed Authentication module! This document is designed for developers, architects, and founders to understand the end-to-end security and authorization flow of the QuickPed platform. By the end of this guide, you will understand how we leverage our tech stack to achieve a highly scalable, stateless, and secure authentication mechanism.

## The Tech Stack
We rely on a modern, robust, and strongly-typed stack for this stateless JWT architecture:
- **Backend (NestJS)**: Provides an opinionated, highly structured architecture using TypeScript. NestJS enforces modularity and offers powerful features like Pipes (for validation), Guards (for authorization), and Interceptors out-of-the-box.
- **Database (Prisma / PostgreSQL)**: PostgreSQL gives us a rock-solid relational database with strong concurrency controls (row-level locking). Prisma acts as a type-safe ORM, eliminating an entire class of SQL-injection vulnerabilities and making schema migrations painless.
- **Frontend (React with Vite)**: React allows us to build a dynamic UI component tree, while Vite provides an ultra-fast developer experience and optimized production builds. The state is centrally managed via the Context API.
- **Stateless JWT**: Instead of storing session cookies in memory or a database (which requires horizontal scaling synchronization), we issue stateless JSON Web Tokens. The token mathematically guarantees the identity of the user.

## The Data Flow
Understanding the flow of data is critical to understanding the QuickPed Auth module:

1. **User** -> Enters phone number in the **React UI**.
2. **React UI** -> Dispatches a POST request via **Axios** to the API.
3. **NestJS Controller** -> Receives the request and routes it to the correct service endpoint.
4. **NestJS Service** -> Validates the rate limits, generates a cryptographically secure OTP, and hashes it.
5. **Prisma ORM** -> Upserts the hashed OTP into **PostgreSQL** using row-level locking.
6. **Twilio/SendGrid** -> Dispatches the OTP SMS/Email to the user.
7. **User** -> Submits the received OTP to the **React UI**.
8. **NestJS Service** -> Hashes the input OTP, compares it with the database, and issues a JWT upon success.
9. **React Context** -> Parses the JWT, saves it, and grants the user access to protected routes.

---

## Section 1: The Database Schema (`schema.prisma`)

Our database schema forms the foundation of our state. The key players here are the `User`, `Role`, and `OtpTracker` models.

### User & Role Models
```prisma
model User {
  id                 String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  phoneNumber        String   @unique
  name               String?
  institutionalEmail String?  @unique
  role               Role     @default(GUEST_RIDER)
  walletBalance      Decimal  @default(0.00) @db.Decimal(10, 2)
  campusId           String?  @db.Uuid
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  campus             Campus?  @relation(fields: [campusId], references: [id])
}

enum Role {
  GUEST_RIDER
  VERIFIED_RIDER
  ADMIN
  SUPER_ADMIN
}
```
**Explanation:** 
- The `User` model assigns a PostgreSQL-native UUID for maximum collision resistance. 
- The `Role` enum defaults to `GUEST_RIDER`. A user only becomes a `VERIFIED_RIDER` once they verify their `.edu` or institutional email address. This dictates what vehicles and campuses they can access.

### OtpTracker Model
```prisma
model OtpTracker {
  identifier         String   @id // Phone number or email
  otpCode            String
  expiresAt          DateTime
  lastRequestAt      DateTime @default(now())
  attempts           Int      @default(0)
}
```
**Why not Redis?** For this phase of QuickPed, using a dedicated Redis instance for OTP caching introduces unnecessary infrastructure overhead. PostgreSQL's concurrency handling is more than sufficient.
By using Prisma's `upsert` command on the `identifier` primary key, PostgreSQL implicitly uses **row-level locking**. If a user double-taps the "Send OTP" button, the database enforces a write lock on that row, preventing race conditions that would otherwise lead to duplicate OTP generation.

---

## Section 2: The Security & Validation Layer (NestJS DTOs & Pipes)

Never trust client input. QuickPed strictly validates incoming network payloads before they ever reach the business logic.

### DTO Validation (`send-phone-otp.dto.ts`)
```typescript
import { IsString, IsNotEmpty } from 'class-validator';

export class SendPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
```
**Explanation:** By decorating our class properties with `class-validator`, we tell NestJS exactly what the payload should look like. 

### The Global ValidationPipe (`main.ts`)
```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true 
  }));
  // ...
}
```
**Explanation:** This pipe is critical. `whitelist: true` strips out any fields from the incoming JSON that are not defined in the DTO. `forbidNonWhitelisted: true` outright rejects the request if malicious extra fields are included. This eliminates NoSQL/SQL injection attacks where attackers try to inject properties like `role: "ADMIN"`.

### Phone Normalization
In our `AuthService`, we normalize phones using `libphonenumber-js`:
```typescript
private normalizePhone(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumberWithError(phone, 'IN');
    return phoneNumber.format('E.164');
  } catch (error) {
    throw new HttpException('Invalid phone number format', HttpStatus.BAD_REQUEST);
  }
}
```
**Explanation:** Naive regex replacements are fragile. We use Google's `libphonenumber-js` to mathematically validate and enforce the E.164 international standard formatting (e.g., `+91XXXXXXXXXX`), ensuring uniformity in our database and routing logic.

---

## Section 3: The Business Logic (`otp.service.ts` & `auth.service.ts`)

This is where the magic happens. The service layer handles security constraints and token generation.

### Cryptographically Secure OTP Generation
```typescript
private generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}
```
**Explanation:** Standard `Math.random()` in JavaScript is predictable and cryptographically insecure. An attacker could potentially predict the sequence of generated OTPs. We use Node's native `crypto.randomInt()`, which relies on the operating system's hardware-based entropy pool, to generate a completely unpredictable 6-digit code.

### Rate Limiting Logic
```typescript
const tracker = await this.prisma.otpTracker.findUnique({
  where: { identifier: normalizedPhone },
});

if (tracker && tracker.lastRequestAt) {
  const diff = (new Date().getTime() - tracker.lastRequestAt.getTime()) / 1000;
  if (diff < 60) {
    throw new HttpException({ error: 'Please wait 60 seconds before requesting a new OTP.' }, HttpStatus.TOO_MANY_REQUESTS);
  }
}
```
**Explanation:** To prevent SMS bombing (and draining our Twilio/SMS balance), we check the `lastRequestAt` timestamp. If the user requests an OTP within 60 seconds of their previous request, we block it and return an HTTP 429 Too Many Requests equivalent.

### Brute-Force Mitigation
```typescript
if (tracker.attempts >= 3) {
  throw new HttpException('Too many failed attempts. Please request a new OTP.', HttpStatus.FORBIDDEN);
}
const hashedInput = this.hashOtp(otpCode);
if (tracker.otpCode !== hashedInput || tracker.expiresAt < new Date()) {
  await this.prisma.otpTracker.update({
    where: { identifier: normalizedPhone },
    data: { attempts: { increment: 1 } },
  });
  throw new HttpException('Invalid or expired OTP', HttpStatus.UNAUTHORIZED);
}
```
**Explanation:** If a malicious actor tries to guess a user's OTP, they only get 3 attempts. After the 3rd failed attempt, the record is flagged, physically invalidating the code and forcing the user to request a brand new one.

### Stateless JWT Generation
```typescript
const user = await this.prisma.user.upsert({ /* ... */ });
const payload = { sub: user.id, role: user.role, campusId: user.campusId };
return {
  status: 'success',
  token: this.jwtService.sign(payload),
};
```
**Explanation:** Once verified, we sign a stateless token containing the user ID, role, and campus ID. Because this token is cryptographically signed, the backend does not need to look up a session ID in the database on subsequent requests, yielding immense performance benefits.

---

## Section 4: The Network Gateways (`auth.controller.ts`)

Controllers act as traffic cops, receiving network requests, parsing payloads, and returning the structured JSON.

```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('otp/send')
  async sendPhoneOtp(@Body() dto: SendPhoneOtpDto) {
    return this.authService.sendPhoneOtp(dto.phoneNumber);
  }

  @Post('otp/verify')
  async verifyPhoneOtp(@Body() dto: VerifyPhoneOtpDto) {
    return this.authService.verifyPhoneOtp(dto.phoneNumber, dto.otpCode);
  }

  @UseGuards(JwtAuthGuard)
  @Post('email-otp/send')
  async sendEmailOtp(@Body() dto: SendEmailOtpDto, @Req() req: any) {
    return this.authService.sendEmailOtp(req.user.sub, dto.email);
  }
  // ...
}
```
**Explanation:** 
- The `@Post` decorators define the HTTP method and route. 
- `@Body()` extracts the JSON body and parses it into our strict DTO class.
- The `@UseGuards(JwtAuthGuard)` protects our email OTP routes. This ensures that only users who have already logged in with a phone number can attach an institutional email to their account.

---

## Section 5: The Frontend Implementation (React & Vite)

Our frontend consumes the APIs securely and manages state seamlessly.

### API Configuration (`axios.ts`)
```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```
**Explanation:** We create a singleton instance of Axios. Vite proxies the `/api/v1` routes in development via `vite.config.ts`, and in production, this points to our deployed backend cluster (which we can configure with Vite environment variables `import.meta.env` if needed).

### JWT Storage & Interceptors
```typescript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qp_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('qp_auth_token');
      localStorage.removeItem('qp_user_profile');
      window.dispatchEvent(new Event('unauthorized_redirect'));
    }
    return Promise.reject(error);
  }
);
```
**Explanation:**
- **Request Interceptor**: Automatically pulls the JWT from local storage and injects it as an `Authorization: Bearer <token>` header on every outgoing API call. Developers don't need to manually attach tokens.
- **Response Interceptor**: Listens for `401 Unauthorized` responses globally. If the backend rejects a token (e.g., expired), this automatically wipes local storage and emits a global event to redirect the user to the login screen.

### The State Manager (`AuthContext.tsx`)
```tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('qp_auth_token'));
  
  // Handle unauthorized global event
  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('unauthorized_redirect', handleUnauthorized);
    return () => window.removeEventListener('unauthorized_redirect', handleUnauthorized);
  }, []);

  const verifyOtp = async (phone: string, otpCode: string): Promise<User | null> => {
    const response = await api.post('/auth/otp/verify', { phoneNumber: phone, otpCode });
    if (response.data.token) {
      localStorage.setItem('qp_auth_token', response.data.token);
      setToken(response.data.token);
      // Fetch and set user profile...
    }
    return null;
  };
  // ...
```
**Explanation:** We use React's Context API to prevent "prop-drilling". The `AuthProvider` wraps the entire application, making the `user` object and `isAuthenticated` boolean available to any deeply-nested component via a simple `useAuth()` hook.

### Security Tradeoffs
Currently, we store the JWT in the browser's `localStorage`. 
- **Risk (XSS Vulnerability)**: If an attacker manages to execute malicious JavaScript on our domain (Cross-Site Scripting), they can read `localStorage` and steal the user's JWT. 
- **Future Migration**: For enhanced security in later iterations, we plan to migrate to `HttpOnly` secure cookies. These cookies are sent automatically by the browser but are invisible to JavaScript, neutralizing XSS token-theft vectors.

---
*End of Document. Read this carefully before contributing to the QuickPed codebase!*
