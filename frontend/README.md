# Stok ve Müşteri Takip Sistemi - Frontend

Modern, responsive React + TypeScript frontend application for stock and customer management.

## Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS framework
- **React Router DOM 6** - Client-side routing
- **TanStack Query 5** - Server state management
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## Features

### Authentication
- JWT-based authentication
- Login page with form validation
- Auto token refresh
- Protected routes
- User role management (Admin/User)

### Dashboard
- Summary cards showing:
  - Total balance (receivables)
  - Total sales
  - Total collections
  - Customer count
  - Product count
  - Low stock alerts
- Recent transactions list
- Low stock products alert

### Product Management
- Add new products with image upload
- Edit product details
- Delete products (Admin only)
- Search and filter products
- Grid/List view toggle
- Low stock badges
- Image preview and upload

### Customer Management
- Add new customers
- Search customers
- Customer detail modal with:
  - Customer information editing
  - Balance summary (debt/credit)
  - Transaction history
  - Add new transactions
  - Filter transactions by type
- Delete customers (Admin only)

### Transaction Management
- Create sales (EXPENSE) or collection (INCOME) transactions
- Product selection for sales
- Auto-calculate amount based on product price × quantity
- Transaction list with filtering
- Delete transactions (Admin only)
- Automatic stock updates

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and endpoints
│   │   ├── client.ts     # Axios instance with interceptors
│   │   ├── auth.api.ts
│   │   ├── products.api.ts
│   │   ├── customers.api.ts
│   │   ├── transactions.api.ts
│   │   └── dashboard.api.ts
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/       # Layout components
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── products/     # Product components
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductEditModal.tsx
│   │   ├── customers/    # Customer components
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CustomerDetailModal.tsx
│   │   │   └── CustomerTransactions.tsx
│   │   ├── transactions/ # Transaction components
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── TransactionItem.tsx
│   │   └── dashboard/    # Dashboard components
│   │       ├── SummaryCard.tsx
│   │       ├── RecentActivities.tsx
│   │       └── LowStockAlert.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProducts.ts
│   │   ├── useCustomers.ts
│   │   ├── useTransactions.ts
│   │   └── useDashboard.ts
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProductsPage.tsx
│   │   └── CustomersPage.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── routes/           # Routing configuration
│   │   ├── AppRouter.tsx
│   │   └── ProtectedRoute.tsx
│   ├── utils/            # Utility functions
│   │   ├── format.ts     # Currency and date formatting
│   │   └── validation.ts # Zod schemas
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
VITE_API_URL=https://stok-2utr.onrender.com
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `https://app.example.com`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Key Features Implementation

### Authentication Flow
1. User logs in with email/password
2. JWT token stored in localStorage
3. Token automatically sent with every API request
4. Auto-redirect on authentication failure
5. Protected routes check authentication status

### Form Validation
- All forms use React Hook Form + Zod
- Turkish error messages
- Real-time validation
- Type-safe form data

### State Management
- TanStack Query for server state
- React Context for authentication
- Automatic cache invalidation
- Optimistic updates

### Responsive Design
- Mobile-first approach
- Sidebar collapses on mobile
- Responsive tables and grids
- Touch-friendly UI elements

### Turkish Localization
- All UI text in Turkish
- Currency formatted as Turkish Lira
- Date formatting with Turkish locale
- Turkish error messages

### Role-Based Access Control
- Admin: Full CRUD operations
- User: Create, Read, Update (no Delete)
- Delete buttons hidden for non-admin users

### Transaction Logic
- **EXPENSE (Satış)**: Increases customer debt
- **INCOME (Tahsilat)**: Decreases customer debt
- **Balance**: Total Expense - Total Income
- Automatic stock reduction on sales
- Product selection optional for transactions

## API Integration

All API calls use Axios with:
- JWT authentication header
- Request/response interceptors
- Automatic token refresh
- Error handling with toast notifications

## Component Patterns

### UI Components
- Reusable, composable components
- Consistent styling with Tailwind
- Variant-based styling (Button, Badge)
- Accessible and semantic HTML

### Forms
- React Hook Form integration
- Zod schema validation
- Error state handling
- Loading states
- Success/error feedback

### Modals
- Portal-based rendering
- Click-outside to close
- Escape key support
- Scroll lock when open
- Multiple size variants

### Lists and Tables
- Empty states
- Loading states
- Click handlers
- Responsive design
- Pagination support

## Best Practices

- TypeScript for type safety
- Component composition over inheritance
- Custom hooks for business logic
- Separation of concerns
- Clean code principles
- No placeholder TODOs
- Production-ready error handling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - All rights reserved
