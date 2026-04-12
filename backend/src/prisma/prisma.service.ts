import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    const isProduction =
      process.env.NODE_ENV === 'production' || !!process.env.RENDER;
    if (isProduction && !/sslmode=/.test(connectionString)) {
      connectionString =
        connectionString +
        (connectionString.includes('?') ? '&' : '?') +
        'sslmode=require';
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    const maxAttempts = 8;
    let delayMs = 500;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        await this.$connect();
        return;
      } catch (e) {
        const code = e?.code as string | undefined;
        if (attempt === maxAttempts) {
          throw e;
        }
        this.logger.warn(
          `Prisma connect failed (attempt ${attempt}/${maxAttempts})${code ? ` code=${code}` : ''}`,
        );
        await new Promise((r) => setTimeout(r, delayMs));
        delayMs = Math.min(8000, Math.floor(delayMs * 1.6));
      }
    }
  }
}
