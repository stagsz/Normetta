import { PrismaClient } from '@prisma/client';
import { config } from './index';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Strip UTF-8 BOM that PowerShell 5.1 can inject when setting Vercel env vars via piped files
const stripBom = (s: string | undefined) => s?.replace(/^﻿/, '').trim();

const dbUrl =
  stripBom(process.env.DATABASE_URL) ||
  stripBom(process.env.POSTGRES_PRISMA_URL) ||
  stripBom(process.env.POSTGRES_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

globalForPrisma.prisma = prisma;

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}
