# 🚀 Quick Setup Guide - Hotel Booking Payment System

## ⚡ Quick Start (5 minutes)

### 1. Set Up Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Create a free account
3. Navigate to **Developers → API Keys**
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_`)

### 2. Create Backend .env File

```bash
cd backend
# Create .env file (if doesn't exist)
# Copy from ENV_TEMPLATE.txt or create new
```

**Add to `backend/.env`:**
```env
# === STRIPE KEYS === #
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# === EMAIL (Optional for receipt emailing) === #
# For Gmail:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

FROM_EMAIL=no-reply@yourdomain.com

# === SERVER === #
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Create Frontend .env File

**Create `frontend/.env`:**
```env
# Use the SAME publishable key from Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
REACT_APP_API_URL=http://localhost:5000
```

### 4. Install Dependencies (if not already done)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5. Start the Servers

**Backend** (already running in background):
```bash
cd backend
node app.js
# Should show: "Server is running on port 5000"
```

**Frontend** (new terminal):
```bash
cd frontend
npm start
# Opens browser at http://localhost:3000
```

---

## 🧪 Test the Payment System

### Option 1: Using Existing Student Account

1. **Login** as a student user
2. Go to **Hotels** page
3. Click on any hotel
4. Click **"Book This Room"**
5. Fill in the booking form:
   - Select room type
   - Choose check-in/check-out dates
   - Enter guest details
6. Click **"Proceed to Payment"**
7. Use **Stripe Test Card**:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```
8. Click **"Pay"**
9. ✅ Success! Receipt downloads automatically
10. Go to **Dashboard → Hotel Bookings** to see your booking

### Option 2: Create New Student Account

1. Go to **Student Registration** page
2. Create account with type = "student"
3. Login with new account
4. Follow steps 2-10 from Option 1 above

### Test Hotel Manager View

1. **Login** as Hotel Owner
2. Go to **Dashboard → Bookings**
3. See the booking with:
   - ✅ PAID badge (green)
   - Payment details section
   - Transaction ID
   - User ID who booked

---

## 🎯 What to Expect

### After Successful Payment:

✅ Booking created with status "confirmed"  
✅ Payment status set to "paid"  
✅ Transaction ID saved  
✅ PDF receipt downloads automatically  
✅ Receipt attempt to email (if SMTP configured)  
✅ Success message displayed  
✅ Booking visible in Student Dashboard  
✅ Booking visible in Hotel Manager Dashboard with payment details  

---

## ❓ Troubleshooting

### "Payment failed" or "Invalid API Key"
- **Fix**: Check `STRIPE_SECRET_KEY` in `backend/.env`
- **Verify**: Key starts with `sk_test_` for testing
- **Restart**: Restart backend server after changing .env

### "Only students can make hotel bookings"
- **Fix**: Ensure you're logged in as a student user
- **Check**: User type in localStorage should be "student"
- **Try**: Register a new student account

### Bookings not showing in Student Dashboard
- **Fix**: Ensure backend is running
- **Check**: Browser console for errors
- **Verify**: User is logged in (check localStorage)

### Receipt not emailing (but PDF downloads)
- **Expected**: Email requires SMTP configuration
- **Optional**: Email setup is not required for basic functionality
- **Works**: PDF download will work regardless

---

## 📋 Environment Variable Checklist

### Backend .env
- [ ] `STRIPE_SECRET_KEY` (starts with sk_test_)
- [ ] `STRIPE_PUBLISHABLE_KEY` (starts with pk_test_)
- [ ] `PORT` (default: 5000)
- [ ] `NODE_ENV` (development)
- [ ] `CLIENT_URL` (http://localhost:3000)
- [ ] SMTP settings (optional, for email)

### Frontend .env
- [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY` (same as backend)
- [ ] `REACT_APP_API_URL` (http://localhost:5000)

---

## 🔍 Verify Installation

### Check Backend
```bash
curl http://localhost:5000/bookings
# Should return: {"bookings":[]}
```

### Check Frontend
1. Open browser to http://localhost:3000
2. Open Developer Tools (F12)
3. Console tab should have no red errors

### Check Stripe Keys
```bash
# In backend directory
node -e "require('dotenv').config(); console.log('Secret Key:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');"
```

---

## 📞 Need Help?

### Common Issues:

**"Module not found"**
```bash
npm install  # In the directory with the error
```

**"Port already in use"**
```bash
# Find and kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

**"Cannot connect to database"**
- Check MongoDB connection string in `backend/app.js`
- Ensure MongoDB Atlas cluster is running
- Verify network access in MongoDB Atlas

---

## ✅ You're Ready!

Once you see:
- ✅ Backend running on port 5000
- ✅ Frontend running on port 3000
- ✅ No console errors
- ✅ Stripe keys configured

**You can start testing hotel bookings with payments!**

Use test card **4242 4242 4242 4242** and enjoy! 🎉

