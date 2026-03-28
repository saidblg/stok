import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly defaultBucket = 'product-images';
  private supabase: SupabaseClient | null = null;
  private useLocal: boolean;
  private localUploadPath: string;
  private resolvedBucket: string;

  constructor(private configService: ConfigService) {
    const storageMode = this.configService.get<string>('STORAGE_MODE', 'local');
    this.resolvedBucket = this.resolveBucketName();

    if (storageMode === 'local') {
      this.useLocal = true;
      this.localUploadPath = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(this.localUploadPath)) {
        fs.mkdirSync(this.localUploadPath, { recursive: true });
      }
    } else {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

      const missingVars: string[] = [];
      if (!supabaseUrl) missingVars.push('SUPABASE_URL');
      if (!supabaseKey) missingVars.push('SUPABASE_KEY');

      if (missingVars.length > 0) {
        throw new Error(`Supabase credentials gerekli (${missingVars.join(', ')})`);
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.useLocal = false;

      if (!process.env.SUPABASE_BUCKET && !this.configService.get<string>('SUPABASE_BUCKET')) {
        this.logger.warn(
          `SUPABASE_BUCKET env bulunamadı, fallback bucket kullanılacak: "${this.defaultBucket}"`,
        );
      }
    }
  }

  async uploadFile(file: Express.Multer.File, bucket?: string): Promise<string> {
    const targetBucket = this.resolveBucketName(bucket);

    if (this.useLocal) {
      return this.uploadFileLocally(file);
    }

    this.logger.log(`Supabase upload bucket: ${targetBucket}`);
    return this.uploadFileToSupabase(file, targetBucket);
  }

  private async uploadFileToSupabase(file: Express.Multer.File, bucket: string): Promise<string> {
    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase client başlatılamadı');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw this.mapSupabaseUploadError(error.message, bucket);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }

  private uploadFileLocally(file: Express.Multer.File): string {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.localUploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    return `${baseUrl}/uploads/${fileName}`;
  }

  async deleteFile(fileUrl: string, bucket?: string): Promise<void> {
    const targetBucket = this.resolveBucketName(bucket);

    if (this.useLocal) {
      this.deleteFileLocally(fileUrl);
      return;
    }

    await this.deleteFileFromSupabase(fileUrl, targetBucket);
  }

  private async deleteFileFromSupabase(fileUrl: string, bucket: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/');

      if (!this.supabase) {
        throw new InternalServerErrorException('Supabase client başlatılamadı');
      }

      const { error } = await this.supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        throw this.mapSupabaseDeleteError(error.message, bucket);
      }
    } catch (error) {
      if (error instanceof InternalServerErrorException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Dosya silinirken beklenmeyen bir hata oluştu');
    }
  }

  private deleteFileLocally(fileUrl: string): void {
    try {
      const url = new URL(fileUrl);
      const fileName = path.basename(url.pathname);
      const filePath = path.join(this.localUploadPath, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Dosya silinirken hata oluştu:', error);
    }
  }

  getPublicUrl(filePath: string, bucket?: string): string {
    const targetBucket = this.resolveBucketName(bucket);

    if (this.useLocal) {
      const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
      return `${baseUrl}/uploads/${path.basename(filePath)}`;
    }

    if (!this.supabase) {
      throw new InternalServerErrorException('Supabase client başlatılamadı');
    }

    const { data } = this.supabase.storage.from(targetBucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  private resolveBucketName(bucket?: string): string {
    const resolved =
      bucket?.trim() ||
      process.env.SUPABASE_BUCKET?.trim() ||
      this.configService.get<string>('SUPABASE_BUCKET')?.trim() ||
      this.defaultBucket;

    if (!resolved) {
      throw new BadRequestException(
        'Supabase bucket adı bulunamadı. SUPABASE_BUCKET env değerini kontrol edin.',
      );
    }

    return resolved;
  }

  private mapSupabaseUploadError(message: string, bucket: string): InternalServerErrorException {
    const lower = message.toLowerCase();

    if (lower.includes('bucket') && lower.includes('not found')) {
      return new InternalServerErrorException(
        `Supabase bucket bulunamadı: "${bucket}". SUPABASE_BUCKET değerini ve bucket adını kontrol edin.`,
      );
    }

    if (lower.includes('jwt') || lower.includes('permission') || lower.includes('unauthorized')) {
      return new InternalServerErrorException(
        'Supabase kimlik doğrulama/yetki hatası. SUPABASE_KEY (service_role) değerini kontrol edin.',
      );
    }

    return new InternalServerErrorException(
      `Dosya yüklenemedi. Bucket: "${bucket}". Supabase hata mesajı: ${message}`,
    );
  }

  private mapSupabaseDeleteError(message: string, bucket: string): InternalServerErrorException {
    const lower = message.toLowerCase();

    if (lower.includes('bucket') && lower.includes('not found')) {
      return new InternalServerErrorException(
        `Supabase bucket bulunamadı: "${bucket}". Dosya silinemedi.`,
      );
    }

    if (lower.includes('jwt') || lower.includes('permission') || lower.includes('unauthorized')) {
      return new InternalServerErrorException(
        'Supabase kimlik doğrulama/yetki hatası nedeniyle dosya silinemedi.',
      );
    }

    return new InternalServerErrorException(
      `Dosya silinemedi. Bucket: "${bucket}". Supabase hata mesajı: ${message}`,
    );
  }
}
