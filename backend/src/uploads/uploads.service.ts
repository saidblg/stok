import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseStorageService } from './storage/supabase-storage.service';

@Injectable()
export class UploadsService {
  constructor(private supabaseStorage: SupabaseStorageService) {}

  async uploadProductImage(file: Express.Multer.File): Promise<{ url: string }> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Sadece JPEG, PNG ve WebP formatları desteklenmektedir');
    }

    if (file.size > maxSize) {
      throw new BadRequestException('Dosya boyutu 5MB\'dan küçük olmalıdır');
    }

    const url = await this.supabaseStorage.uploadFile(file, 'product-images');

    return { url };
  }

  async deleteProductImage(imageUrl: string): Promise<void> {
    await this.supabaseStorage.deleteFile(imageUrl, 'product-images');
  }
}
