import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  onModuleInit(): void {}
}
