# Quick Start Guide

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running (default: http://localhost:3000)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure API URL** (optional, defaults to http://localhost:3000):
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will start at `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

## Default Login Credentials

Use these credentials to log in (must match backend seed data):

- **Email:** admin@example.com
- **Password:** Admin123!
- **Role:** ADMIN (full access)

## First Steps

1. **Login** - Use the credentials above
2. **Dashboard** - View summary statistics
3. **Add Products** - Go to Products page, fill the form
4. **Add Customers** - Go to Customers page, fill the form
5. **Create Transactions** - Click on a customer to open detail modal, add transactions

## Key Features

### Dashboard
- View total sales, collections, and balance
- See recent transactions
- Check low stock products

### Products
- Add products with image upload
- Edit product details
- Delete products (Admin only)
- Search products
- Toggle grid/list view

### Customers
- Add customers with contact details
- Click customer to view details
- Edit customer information
- View balance (debt/credit)
- Add transactions (sales/collections)
- View transaction history

### Transactions
- **Sales (EXPENSE)** - Increases customer debt, reduces product stock
- **Collections (INCOME)** - Decreases customer debt

## Transaction Types Explained

### Satış (EXPENSE)
- Customer owes you money
- Increases customer debt (balance)
- Can link to a product
- Automatically reduces product stock
- Amount auto-calculated: quantity × sale price

### Tahsilat (INCOME)
- Customer pays you
- Decreases customer debt (balance)
- No product linkage
- Manual amount entry

### Balance Calculation
```
Balance = Total Sales (EXPENSE) - Total Collections (INCOME)

Positive balance = Customer owes you (receivable)
Negative balance = You owe customer (payable)
```

## Tips

1. **Image Upload**: Upload product images up to 5MB (PNG, JPG, WEBP)
2. **Search**: Use search boxes to filter products/customers
3. **Mobile**: Fully responsive, use hamburger menu on mobile
4. **Filters**: Filter transactions by type (Sales/Collections)
5. **Stock Alerts**: Check dashboard for low stock warnings

## Common Issues

### API Connection Error
- Ensure backend is running on port 3000
- Check VITE_API_URL in .env file
- Verify CORS is enabled on backend

### Authentication Error
- Check if admin user exists in database
- Run backend seed script if needed
- Clear localStorage and try again

### Build Errors
- Delete node_modules and run `npm install` again
- Clear npm cache: `npm cache clean --force`
- Check Node.js version (18+)

## File Upload

For product images to work properly:
- Backend must have uploads endpoint configured
- If using Supabase, ensure bucket is created and public
- Local uploads folder must have write permissions

## Development Tips

1. **Hot Reload**: Changes auto-reload in dev mode
2. **TypeScript**: Use VSCode for best TypeScript experience
3. **Console**: Check browser console for errors
4. **Network**: Use browser DevTools to inspect API calls
5. **State**: React Query DevTools (optional) can help debug

## Support

For issues or questions:
1. Check README.md for detailed documentation
2. Review plan file for system specifications
3. Inspect browser console for errors
4. Verify backend API is working correctly

## Next Steps

After familiarizing yourself with the UI:
1. Customize branding and colors in tailwind.config.js
2. Add more features as needed
3. Deploy to production (Vercel, Netlify, etc.)
4. Set up production environment variables
5. Configure production API URL
