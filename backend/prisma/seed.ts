import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const hashedPassword = await bcrypt.hash('Admin123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin Kullanıcı',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin kullanıcı oluşturuldu:', adminUser.email);

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Normal Kullanıcı',
      role: 'USER',
    },
  });

  console.log('✅ Normal kullanıcı oluşturuldu:', regularUser.email);

  const sampleProduct = await prisma.product.create({
    data: {
      name: 'Örnek Ürün',
      purchasePrice: 50.00,
      salePrice: 100.00,
      stock: 100,
      lowStockThreshold: 10,
    },
  });

  console.log('✅ Örnek ürün oluşturuldu:', sampleProduct.name);

  const sampleCustomer = await prisma.customer.create({
    data: {
      name: 'Örnek Müşteri A.Ş.',
      phone: '0555 123 45 67',
      email: 'musteri@example.com',
      address: 'İstanbul, Türkiye',
      notes: 'Örnek müşteri notu',
    },
  });

  console.log('✅ Örnek müşteri oluşturuldu:', sampleCustomer.name);

  console.log('🎉 Seeding tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
