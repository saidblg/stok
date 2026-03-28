# 🚀 Hızlı Kurulum Kılavuzu

Bu dokuman projeyi sıfırdan kurmanız için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

Sisteminizde bu araçların yüklü olması gerekiyor:
- **Node.js** 18 veya üzeri ([nodejs.org](https://nodejs.org/))
- **npm** (Node.js ile birlikte gelir)
- **PostgreSQL** database (veya Supabase hesabı)

## 🗄️ Adım 1: Database Hazırlığı

### Seçenek A: Supabase (Ücretsiz, Önerilen)

1. [supabase.com](https://supabase.com) adresine gidin
2. "Start your project" → "New project" oluşturun
3. Proje adı ve database şifresi belirleyin
4. **Database** sekmesine gidin
5. "Connection string" → "URI" sekmesini açın
6. Connection string'i kopyalayın (şifrenizi `[YOUR-PASSWORD]` yerine yazın)

Örnek:
```
postgresql://postgres.xxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

### Seçenek B: Lokal PostgreSQL

```bash
# PostgreSQL kurulumu (macOS)
brew install postgresql@14
brew services start postgresql@14

# Database oluştur
createdb stok_cari_db
```

Connection string:
```
postgresql://localhost:5432/stok_cari_db
```

## 📦 Adım 2: Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Bağımlılıkları yükle (2-3 dakika sürer)
npm install

# .env dosyası oluştur
cp .env.example .env
```

### .env Dosyasını Düzenleyin

`backend/.env` dosyasını açın ve şu değerleri doldurun:

```env
# 1. Database bağlantısı (Adım 1'den)
DATABASE_URL="postgresql://..."

# 2. JWT secret (güvenli bir değer girin)
JWT_SECRET="super-secret-jwt-key-change-in-production-123456"
JWT_EXPIRES_IN="7d"

# 3. Supabase (sonra yapılandıracağız, şimdilik local bırakın)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_KEY="your-key"
SUPABASE_BUCKET="product-images"
STORAGE_MODE="local"

# 4. CORS (frontend URL'i)
CORS_ORIGIN="http://localhost:5173"

# 5. Port
PORT=3000
```

### Database'i Hazırlayın

```bash
# Prisma client oluştur
npx prisma generate

# Database migration (tablolar oluşturulur)
npx prisma migrate dev --name init

# Seed data (örnek admin kullanıcı)
npm run seed
```

Çıktıda şunları görmelisiniz:
```
✅ Admin kullanıcı oluşturuldu: admin@example.com
✅ Normal kullanıcı oluşturuldu: user@example.com
✅ Örnek ürün oluşturuldu: Örnek Ürün
✅ Örnek müşteri oluşturuldu: Örnek Müşteri A.Ş.
🎉 Seeding tamamlandı!
```

### Backend'i Başlatın

```bash
npm run start:dev
```

Başarılı olursa:
```
[Nest] Application successfully started
🚀 Server running on http://localhost:3000
📚 Swagger docs: http://localhost:3000/api-docs
```

**Test edin:** Tarayıcıda [http://localhost:3000/api-docs](http://localhost:3000/api-docs) açın.

## 🎨 Adım 3: Frontend Kurulumu

**Yeni bir terminal penceresi açın** (backend çalışmaya devam etsin).

```bash
# Frontend klasörüne git
cd frontend

# Bağımlılıkları yükle (2-3 dakika sürer)
npm install

# .env dosyası oluştur
cp .env.example .env
```

### .env Dosyasını Düzenleyin

`frontend/.env` dosyasını açın:

```env
VITE_API_URL=http://localhost:3000
```

### Frontend'i Başlatın

```bash
npm run dev
```

Başarılı olursa:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## ✅ Adım 4: Test Edin!

1. Tarayıcıda [http://localhost:5173](http://localhost:5173) adresini açın
2. Login sayfası açılmalı
3. Şu bilgilerle giriş yapın:
   - **Email:** `admin@example.com`
   - **Şifre:** `Admin123!`
4. Dashboard açılmalı ve örnek verileri görmelisiniz!

## 🖼️ Adım 5: Supabase Storage (Opsiyonel)

Ürün fotoğrafları için Supabase Storage kullanmak isterseniz:

### 1. Storage Bucket Oluşturun

1. [Supabase Dashboard](https://app.supabase.com) → Projenizi seçin
2. Sol menüden **Storage** → **Create a new bucket**
3. Bucket adı: `product-images`
4. **Public bucket** seçeneğini işaretleyin
5. **Create bucket**

### 2. Public Access Policy Ekleyin

1. `product-images` bucket'ına tıklayın
2. **Policies** sekmesine gidin
3. **New Policy** → **For full customization**
4. Policy adı: `Public Access`
5. Allowed operation: `SELECT`
6. Policy definition:
```sql
true
```
7. **Review** → **Save policy**

### 3. Supabase Credentials

1. Sol menüden **Settings** → **API**
2. **Project URL**'i kopyalayın
3. **anon** **public** key'i kopyalayın

### 4. Backend .env Güncelleyin

```env
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_BUCKET="product-images"
STORAGE_MODE="supabase"
```

### 5. Backend'i Yeniden Başlatın

Backend terminalinde `Ctrl+C` yapın, sonra:
```bash
npm run start:dev
```

Artık ürün fotoğrafları Supabase'e yüklenecek!

## 🎯 Sonraki Adımlar

Artık sistemi kullanabilirsiniz:

1. **Dashboard**: Özet istatistikler
2. **Ürünler**: Ürün ekleyin, fotoğraf yükleyin
3. **Müşteriler**: Müşteri ekleyin, cari takip yapın
4. **İşlemler**: Satış ve tahsilat kayıtları

### Admin Panel Özellikleri

**Admin Kullanıcı** (admin@example.com):
- Tüm özellikler
- Silme yetkisi var
- Kullanıcı yönetimi (Swagger'dan)

**Normal Kullanıcı** (user@example.com):
- Veri ekleme/düzenleme
- Silme yetkisi yok

## 🔧 Sorun Giderme

### Backend başlamıyor

**Hata:** `Error: connect ECONNREFUSED`
- Database bağlantısını kontrol edin
- DATABASE_URL doğru mu?
- PostgreSQL/Supabase çalışıyor mu?

**Hata:** `Prisma schema not found`
```bash
npx prisma generate
```

**Hata:** `Port 3000 already in use`
```bash
# Port 3000'i kullanan işlemi durdurun
lsof -ti:3000 | xargs kill -9

# Veya .env'de PORT'u değiştirin
PORT=3001
```

### Frontend bağlanmıyor

**Hata:** `Network Error`
- Backend çalışıyor mu? (http://localhost:3000/api-docs test edin)
- CORS ayarları doğru mu?
- Frontend `.env` dosyasında VITE_API_URL doğru mu?

**Hata:** `Failed to fetch`
- Tarayıcı console'da network sekmesini kontrol edin
- Backend loglarına bakın

### Supabase storage çalışmıyor

- Bucket public mi?
- Policy doğru kurulmuş mu?
- SUPABASE_KEY doğru mu? (anon public key olmalı)
- STORAGE_MODE="supabase" mi?

### Prisma migration hataları

```bash
# Migration sıfırlama (dikkat: tüm veri silinir!)
npx prisma migrate reset

# Tekrar seed
npm run seed
```

## 📚 Yararlı Komutlar

### Backend
```bash
npm run start:dev      # Development mode
npm run build          # Production build
npm run start:prod     # Production mode
npm run seed           # Seed data
npx prisma studio      # Database GUI
npx prisma migrate dev # New migration
```

### Frontend
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

## 🎊 Tebrikler!

Projeniz hazır! Artık stok ve cari takibini yapabilirsiniz.

Sorularınız için issue açabilirsiniz.
