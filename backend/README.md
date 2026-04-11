# Tourism Backend

## Environment Variables
Create a `.env` file in the project root with:
```
MONGODB_URI=mongodb://localhost:27017/tourism_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
HOST=127.0.0.1
```
Generate a strong secret (example):
```
# PowerShell
[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
```

## User Endpoints
- POST /api/users/register
- POST /api/users/login

All responses follow structure:
```
{ success: boolean, message: string, data?: object, token?: string }
```

## Start Dev Server
```
npm run dev
```

## Notes
- Passwords hashed automatically via Mongoose pre-save hook.
- JWT includes user id and role.
- Add future auth middleware to protect routes.
