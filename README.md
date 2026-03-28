# Stok ve Müşteri Cari Takip Sistemi

Production-ready, modern ve tam özellikli stok yönetimi ve müşteri cari takip web uygulaması.

## 🚀 Özellikler

### 🔐 Kimlik Doğrulama
- JWT tabanlı güvenli giriş sistemi
- Rol bazlı yetkilendirme (Admin / User)
- Token yönetimi ve otomatik yenileme

### 📦 Ürün Yönetimi
- Ürün ekleme, düzenleme, silme
- Fotoğraf yükleme (Supabase Storage)
- Alış ve satış fiyatı takibi
- Otomatik stok yönetimi
- Düşük stok uyarıları
- Arama ve filtreleme

### 👥 Müşteri Yönetimi
- Müşteri bilgileri (ad, telefon, email, adres)
- Detaylı müşteri profilleri
- Cari hesap takibi
- Alacak/borç hesaplaması

### 💰 Cari/İşlem Yönetimi
- Satış kaydı (stoktan otomatik düşer)
- Tahsilat kaydı
- İşlem geçmişi
- Tarih bazlı filtreleme
- Otomatik bakiye hesaplama

### 📊 Dashboard
- Toplam tahsilat, alacak, bakiye
- Müşteri ve ürün sayıları
- Kritik stok uyarıları
- Son işlemler
- Grafiksel özet

## 🛠️ Teknoloji Stack

### Backend
- **NestJS** - Enterprise Node.js framework
- **Prisma ORM** - Type-safe database ORM
- **PostgreSQL** - Production-grade database
- **JWT** - Secure authentication
- **Swagger** - API documentation
- **Supabase** - Storage and database hosting

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first CSS
- **TanStack Query** - Server state management
- **React Hook Form + Zod** - Form validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📁 Proje Yapısı

```
kerimproje/
├── backend/          # NestJS backend
│   ├── prisma/       # Database schema & migrations
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── products/ # Product management
│   │   ├── customers/# Customer management
│   │   ├── transactions/ # Transaction & stock management
│   │   ├── dashboard/    # Dashboard aggregations
│   │   ├── uploads/      # File upload (Supabase)
│   │   ├── common/       # Shared utilities
│   │   └── prisma/       # Prisma service
│   └── uploads/      # Local file storage (fallback)
│
└── frontend/         # React frontend
    ├── public/
    └── src/
        ├── api/           # API clients
        ├── components/    # React components
        │   ├── ui/        # Reusable UI components
        │   ├── layout/    # Layout components
        │   ├── dashboard/ # Dashboard components
        │   ├── products/  # Product components
        │   ├── customers/ # Customer components
        │   └── transactions/ # Transaction components
        ├── contexts/      # React contexts
        ├── hooks/         # Custom hooks
        ├── pages/         # Page components
        ├── routes/        # Routing
        ├── types/         # TypeScript types
        └── utils/         # Utilities
```

## 🚦 Kurulum ve Çalıştırma

### Ön Gereksinimler
- Node.js 18+
- PostgreSQL database (veya Supabase hesabı)
- npm veya yarn

### 1. Repository'yi Klonlayın
```bash
cd kerimproje
```

### 2. Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
```

**.env dosyasını düzenleyin:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-supabase-key"
SUPABASE_BUCKET="product-images"
STORAGE_MODE="supabase"  # veya "local"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
```

```bash
# Prisma client oluştur
npx prisma generate

# Database migration
npx prisma migrate dev

# Seed verisi ekle (admin kullanıcı)
npm run seed

# Backend'i başlat
npm run start:dev
```

Backend şimdi **http://localhost:3000** adresinde çalışıyor.
Swagger UI: **http://localhost:3000/api-docs**

### 3. Frontend Kurulumu

```bash
# Frontend klasörüne git
cd ../frontend

# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
```

**.env dosyasını düzenleyin:**
```env
VITE_API_URL=http://localhost:3000
```

```bash
# Frontend'i başlat
npm run dev
```

Frontend şimdi **http://localhost:5173** adresinde çalışıyor.

### 4. Giriş Yapın

**Default Admin Kullanıcı:**
- Email: `admin@example.com`
- Şifre: `Admin123!`

**Default User Kullanıcı:**
- Email: `user@example.com`
- Şifre: `Admin123!`

## 🗄️ Supabase Kurulumu

### 1. Supabase Project Oluşturun
1. [supabase.com](https://supabase.com) adresine gidin
2. Yeni proje oluşturun
3. **Database** sekmesinden connection string'i kopyalayın
4. Backend `.env` dosyasındaki `DATABASE_URL`'i güncelleyin

### 2. Storage Bucket Oluşturun
1. Supabase dashboard'da **Storage** sekmesine gidin
2. "Create bucket" butonuna tıklayın
3. Bucket adı: `product-images`
4. Public bucket olarak işaretleyin
5. **Policies** sekmesinde "New Policy" oluşturun:
   - Allow public read access

### 3. Backend .env Güncelleyin
```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-anon-public-key"
SUPABASE_BUCKET="product-images"
STORAGE_MODE="supabase"
```

## 📖 API Dokümantasyonu

Backend çalışırken Swagger UI'a erişin: **http://localhost:3000/api-docs**

### Temel Endpoint'ler

#### Authentication
- `POST /auth/login` - Kullanıcı girişi
- `GET /auth/me` - Mevcut kullanıcı bilgisi

#### Users (Admin Only)
- `POST /users` - Kullanıcı oluştur
- `GET /users` - Kullanıcıları listele
- `DELETE /users/:id` - Kullanıcı sil

#### Products
- `GET /products` - Ürünleri listele
- `POST /products` - Ürün ekle
- `GET /products/:id` - Ürün detayı
- `PATCH /products/:id` - Ürün güncelle
- `DELETE /products/:id` - Ürün sil (Admin)

#### Customers
- `GET /customers` - Müşterileri listele
- `POST /customers` - Müşteri ekle
- `GET /customers/:id` - Müşteri detayı
- `PATCH /customers/:id` - Müşteri güncelle
- `DELETE /customers/:id` - Müşteri sil (Admin)
- `GET /customers/:id/balance` - Müşteri bakiye özeti

#### Transactions
- `GET /transactions` - İşlemleri listele
- `POST /transactions` - İşlem ekle
- `GET /transactions/:id` - İşlem detayı
- `PATCH /transactions/:id` - İşlem güncelle
- `DELETE /transactions/:id` - İşlem sil (Admin)
- `GET /customers/:id/transactions` - Müşteri işlemleri

#### Dashboard
- `GET /dashboard/summary` - Dashboard özet istatistikler
- `GET /dashboard/recent-transactions` - Son işlemler
- `GET /dashboard/low-stock-products` - Düşük stoklu ürünler

#### Uploads
- `POST /uploads/product-image` - Ürün fotoğrafı yükle

## 🎯 Önemli Business Logic

### Cari Mantık
- **EXPENSE (Satış)**: Müşteri borcu ARTAR, stok AZALIR
- **INCOME (Tahsilat)**: Müşteri borcu AZALIR
- **Bakiye**: `Toplam Gider - Toplam Gelir`
  - Pozitif bakiye = Müşteri size borçlu
  - Negatif bakiye = Siz müşteriye borçlusunuz

### Stok Yönetimi
- Satış kaydı oluşturulduğunda (EXPENSE + productId) stok otomatik azalır
- İşlem silindiğinde stok geri eklenir
- İşlem güncellendiğinde stok farkı hesaplanır
- Yetersiz stok durumunda hata döner

### Yetkilendirme
- **Admin**: Tüm CRUD işlemleri
- **User**: Create, Read, Update (Delete hariç)

## 🚀 Production Deployment

### Backend Deployment (Render/Railway)

1. **Render.com** veya **Railway.app**'te yeni web service oluşturun
2. Repository'yi bağlayın (veya manuel deploy)
3. Build command: `cd backend && npm install && npx prisma generate && npm run build`
4. Start command: `cd backend && npm run start:prod`
5. Environment variables ekleyin (.env değerlerini)
6. Deploy edin

### Frontend Deployment (Vercel/Netlify)

#### Vercel
```bash
cd frontend
npx vercel
```

#### Netlify
```bash
cd frontend
npm run build
# dist/ klasörünü Netlify'a yükleyin
```

**Environment Variable:**
- `VITE_API_URL`: Production backend URL'i

### Production .env Değerleri

**Backend:**
```env
DATABASE_URL="postgresql://..."  # Supabase connection string
JWT_SECRET="güçlü-random-secret-key"
CORS_ORIGIN="https://your-frontend-domain.com"
STORAGE_MODE="supabase"
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-domain.com
```

## 🧪 Test Senaryoları

1. Login → Dashboard → Verilerin görüntülenmesi
2. Ürün ekle → Listeye düşmesi
3. Ürün fotoğrafı yükle → Gösterilmesi
4. Müşteri ekle → Detay modalının açılması
5. Satış yap (ürünlü) → Stokun azalması
6. Tahsilat yap → Bakiyenin güncellenmesi
7. Search/Filter → Çalışması
8. User rolü ile delete butonunun görünmemesi
9. Responsive tasarım → Mobile görünüm

## 📝 Lisans

MIT

## 👨‍💻 Geliştirici Notları

- Tüm API istekleri JWT token ile korunmaktadır
- Frontend localStorage'da token saklar
- Backend otomatik validation yapar (class-validator)
- Tüm hata mesajları Türkçe'dir
- Currency formatı: 1.234,56 ₺
- Tarih formatı: Turkish locale

## 🆘 Sorun Giderme

### Backend çalışmıyor
- PostgreSQL bağlantısını kontrol edin
- `npx prisma generate` komutunu çalıştırın
- `.env` dosyasının doğru olduğundan emin olun

### Frontend API'ye bağlanmıyor
- Backend'in çalıştığından emin olun
- CORS ayarlarını kontrol edin
- `.env` dosyasındaki `VITE_API_URL`'i kontrol edin

### Supabase storage çalışmıyor
- Bucket'ın public olduğundan emin olun
- SUPABASE_KEY'in doğru olduğunu kontrol edin
- Policy'lerin doğru ayarlandığından emin olun

### Stok azalmıyor
- Transaction type'ın `EXPENSE` olduğundan emin olun
- ProductId'nin geçerli olduğunu kontrol edin
- Quantity'nin pozitif olduğunu kontrol edin

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

---

**⭐ Projeyi beğendiyseniz yıldız vermeyi unutmayın!**
