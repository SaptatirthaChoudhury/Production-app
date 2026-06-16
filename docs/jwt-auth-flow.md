# JWT Authentication Flow

This diagram follows the authentication model implemented in this codebase:

- `User` model methods create JWTs with `jwt.sign(...)`
- `loginUser` sends tokens to the client
- `verifyJWT` protects secured routes
- `refreshAccessToken` verifies the stored refresh token
- `logoutUser` clears the refresh token from the database

```mermaid
flowchart TD
    A[Client] -->|POST /api/v1/users/register<br/>fullname, email, username, password, avatar| B[registerUser]
    B --> C[Validate required fields]
    C --> D[Check existing username/email]
    D --> E[Upload avatar/coverImage to Cloudinary]
    E --> F[User.create]
    F --> G[User model pre-save hook]
    G -->|bcrypt.hash password| H[(MongoDB Users)]
    H --> I[Return created user<br/>without password/refreshToken]

    A -->|POST /api/v1/users/login<br/>email or username + password| J[loginUser]
    J --> K[Find user in MongoDB]
    K --> L[user.isPasswordCorrect]
    L -->|bcrypt.compare| M{Password valid?}
    M -->|No| N[401 Invalid credentials]
    M -->|Yes| O[generateAccessAndRefreshToken user._id]

    O --> P[User.findById]
    P --> Q[user.generateAccessToken]
    Q -->|jwt.sign payload + ACCESS_TOKEN_SECRET| R[Access Token]
    P --> S[user.generateRefreshToken]
    S -->|jwt.sign _id + REFRESH_TOKEN_SECRET| T[Refresh Token]
    T --> U[Save refreshToken on user document]
    U --> H

    R --> V[Set accessToken cookie<br/>httpOnly + secure]
    T --> W[Set refreshToken cookie<br/>httpOnly + secure]
    V --> X[Return user + tokens]
    W --> X
    X --> A

    A -->|Request protected route<br/>Cookie or Authorization Bearer token| Y[verifyJWT middleware]
    Y --> Z[Read accessToken]
    Z --> AA{Token exists?}
    AA -->|No| AB[401 Unauthorized]
    AA -->|Yes| AC[jwt.verify accessToken<br/>ACCESS_TOKEN_SECRET]
    AC --> AD[Find user by decoded _id]
    AD --> AE{User found?}
    AE -->|No| AF[401 Invalid access token]
    AE -->|Yes| AG[Attach user to req.user]
    AG --> AH[Run protected controller]

    A -->|POST /api/v1/users/refresh-token<br/>refreshToken cookie/body| AI[refreshAccessToken]
    AI --> AJ[Read incoming refresh token]
    AJ --> AK{Refresh token exists?}
    AK -->|No| AL[401 Unauthorized]
    AK -->|Yes| AM[jwt.verify refreshToken<br/>REFRESH_TOKEN_SECRET]
    AM --> AN[Find user by decoded _id]
    AN --> AO[Compare incoming token<br/>with user.refreshToken in DB]
    AO --> AP{Token matches DB?}
    AP -->|No| AQ[401 Token expired or used]
    AP -->|Yes| AR[Generate new access + refresh tokens]
    AR --> AS[Save new refreshToken in DB]
    AS --> AT[Set new cookies]
    AT --> A

    A -->|POST /api/v1/users/logout| AU[verifyJWT]
    AU --> AV[logoutUser]
    AV --> AW[Set user.refreshToken = undefined]
    AW --> H
    AW --> AX[Clear accessToken + refreshToken cookies]
    AX --> A
```

## Mental Model

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant AuthMiddleware as verifyJWT
    participant Controller as User Controller
    participant UserModel as User Model
    participant MongoDB

    Client->>Express: Login request
    Express->>Controller: loginUser
    Controller->>UserModel: find user
    UserModel->>MongoDB: query users
    MongoDB-->>UserModel: user document
    Controller->>UserModel: isPasswordCorrect(password)
    UserModel-->>Controller: true
    Controller->>UserModel: generateAccessToken()
    UserModel-->>Controller: access token
    Controller->>UserModel: generateRefreshToken()
    UserModel-->>Controller: refresh token
    Controller->>MongoDB: save refreshToken
    Controller-->>Client: user + cookies + tokens

    Client->>Express: Protected request
    Express->>AuthMiddleware: verifyJWT
    AuthMiddleware->>AuthMiddleware: jwt.verify(accessToken)
    AuthMiddleware->>MongoDB: find user by decoded _id
    MongoDB-->>AuthMiddleware: user without password/refreshToken
    AuthMiddleware->>Controller: req.user = user
    Controller-->>Client: protected response
```

## Token Responsibilities

```mermaid
flowchart LR
    A[Access Token] --> B[Short lived]
    A --> C[Used for protected routes]
    A --> D[Verified by verifyJWT middleware]
    A --> E[Can be sent via cookie or Authorization header]

    F[Refresh Token] --> G[Longer lived]
    F --> H[Used to create a new access token]
    F --> I[Stored in MongoDB on user.refreshToken]
    F --> J[Compared during refreshAccessToken]
    F --> K[Removed during logout]
```

