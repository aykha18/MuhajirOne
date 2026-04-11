import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const m = /^([^=]+)=(.*)$/.exec(line.trim());
      if (m) {
        const key = m[1];
        const val = m[2].trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

function getPrisma(): PrismaClient {
  loadEnv();
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL not found');
  }
  if (
    connectionString.includes('render.com') &&
    !/sslmode=/.test(connectionString)
  ) {
    connectionString =
      connectionString +
      (connectionString.includes('?') ? '&' : '?') +
      'sslmode=require';
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function main() {
  const email = process.argv[2]?.trim();
  const flagRaw = process.argv[3]?.trim().toLowerCase();
  const isAdmin = flagRaw
    ? flagRaw === 'true' || flagRaw === '1' || flagRaw === 'yes'
    : true;

  if (!email) {
    throw new Error(
      'Usage: ts-node src/scripts/set-admin.ts <email> [true|false]',
    );
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { isAdmin },
  });

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        id: updated.id,
        email: updated.email,
        isAdmin: updated.isAdmin,
      },
      null,
      2,
    ) + '\n',
  );
}

main()
  .catch((e) => {
    process.stderr.write(String(e instanceof Error ? e.message : e) + '\n');
    process.exitCode = 1;
  })
  .finally(() => {});
