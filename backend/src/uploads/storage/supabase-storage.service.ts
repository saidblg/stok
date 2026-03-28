import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupabaseStorageService {
  private supabase: SupabaseClient | null = null;
  private useLocal: boolean;
  private localUploadPath: string;

  constructor(private configService: ConfigService) {
    const storageMode = this.configService.get<string>('STORAGE_MODE', 'local');

    if (storageMode === 'local') {
      this.useLocal = true;
      this.localUploadPath = path.join(process.cwd(), 'uploads');

      if (!fs.existsSync(this.localUploadPath)) {
        fs.mkdirSync(this.localUploadPath, { recursive: true });
      }
    } else {
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials gerekli (SUPABASE_URL, SUPABASE_KEY)');
      }

      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.useLocal = false;
    }
  }

  async uploadFile(file: Express.Multer.File, bucket: string): Promise<string> {
    if (this.useLocal) {
      return this.uploadFileLocally(file);
    }

    return this.uploadFileToSupabase(file, bucket);
  }

  private async uploadFileToSupabase(file: Express.Multer.File, bucket: string): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(`Dosya yüklenirken hata oluştu: ${error.message}`);
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

  async deleteFile(fileUrl: string, bucket: string): Promise<void> {
    if (this.useLocal) {
      this.deleteFileLocally(fileUrl);
      return;
    }

    this.deleteFileFromSupabase(fileUrl, bucket);
  }

  private async deleteFileFromSupabase(fileUrl: string, bucket: string): Promise<void> {
    try {
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(-2).join('/');

      const { error } = await this.supabase.storage.from(bucket).remove([filePath]);

      if (error) {
        console.error('Dosya silinirken hata oluştu:', error.message);
      }
    } catch (error) {
      console.error('Dosya silinirken hata oluştu:', error);
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

  getPublicUrl(filePath: string, bucket: string): string {
    if (this.useLocal) {
      const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
      return `${baseUrl}/uploads/${path.basename(filePath)}`;
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }
}
