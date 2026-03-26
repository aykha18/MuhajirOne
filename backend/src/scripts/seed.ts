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
        const val = m[2];
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

function getPrisma(): PrismaClient {
  loadEnv();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL not found');
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function main() {
  const prisma = getPrisma();

  const users = [
    {
      fullName: 'Amit Sharma',
      city: 'Mumbai',
      corridor: 'South Asia',
      phoneNumber: '+91-9876500001',
      email: 'amit.sharma@example.com',
    },
    {
      fullName: 'Priya Patel',
      city: 'Delhi',
      corridor: 'South Asia',
      phoneNumber: '+91-9876500002',
      email: 'priya.patel@example.com',
    },
    {
      fullName: 'Rahul Verma',
      city: 'Bengaluru',
      corridor: 'South Asia',
      phoneNumber: '+91-9876500003',
      email: 'rahul.verma@example.com',
    },
    {
      fullName: 'Ayesha Khan',
      city: 'Karachi',
      corridor: 'South Asia',
      phoneNumber: '+92-3030000001',
      email: 'ayesha.khan@example.com',
    },
    {
      fullName: 'Bilal Ahmed',
      city: 'Lahore',
      corridor: 'South Asia',
      phoneNumber: '+92-3030000002',
      email: 'bilal.ahmed@example.com',
    },
    {
      fullName: 'Zain Ali',
      city: 'Islamabad',
      corridor: 'South Asia',
      phoneNumber: '+92-3030000003',
      email: 'zain.ali@example.com',
    },
    {
      fullName: 'Nusrat Jahan',
      city: 'Dhaka',
      corridor: 'South Asia',
      phoneNumber: '+880-1700000001',
      email: 'nusrat.jahan@example.com',
    },
    {
      fullName: 'Tanvir Islam',
      city: 'Chittagong',
      corridor: 'South Asia',
      phoneNumber: '+880-1700000002',
      email: 'tanvir.islam@example.com',
    },
    {
      fullName: 'Nuwan Perera',
      city: 'Colombo',
      corridor: 'South Asia',
      phoneNumber: '+94-770000001',
      email: 'nuwan.perera@example.com',
    },
    {
      fullName: 'Dilani Silva',
      city: 'Kandy',
      corridor: 'South Asia',
      phoneNumber: '+94-770000002',
      email: 'dilani.silva@example.com',
    },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: u.phoneNumber },
      update: {
        fullName: u.fullName,
        city: u.city,
        corridor: u.corridor,
        email: u.email,
      },
      create: {
        phoneNumber: u.phoneNumber,
        email: u.email,
        fullName: u.fullName,
        city: u.city,
        corridor: u.corridor,
        verificationLevel: 1,
      },
    });
    createdUsers.push(user);
  }

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const currencyPostsData = [
    {
      userIdx: 0,
      haveCurrency: 'INR',
      needCurrency: 'AED',
      amount: '120000',
      preferredRate: '0.044',
      city: 'Mumbai',
    },
    {
      userIdx: 1,
      haveCurrency: 'INR',
      needCurrency: 'USD',
      amount: '80000',
      preferredRate: '0.012',
      city: 'Delhi',
    },
    {
      userIdx: 3,
      haveCurrency: 'PKR',
      needCurrency: 'AED',
      amount: '500000',
      preferredRate: '0.013',
      city: 'Karachi',
    },
    {
      userIdx: 4,
      haveCurrency: 'PKR',
      needCurrency: 'USD',
      amount: '300000',
      preferredRate: '0.0036',
      city: 'Lahore',
    },
    {
      userIdx: 6,
      haveCurrency: 'BDT',
      needCurrency: 'AED',
      amount: '400000',
      preferredRate: '0.033',
      city: 'Dhaka',
    },
  ];

  const createdCurrencyPosts = [];
  for (const p of currencyPostsData) {
    const post = await prisma.currencyPost.create({
      data: {
        userId: createdUsers[p.userIdx].id,
        haveCurrency: p.haveCurrency,
        needCurrency: p.needCurrency,
        amount: p.amount,
        preferredRate: p.preferredRate,
        city: p.city,
        expiryDate: in30,
        status: 'active',
      },
    });
    createdCurrencyPosts.push(post);
  }

  const matchRequestsData = [
    { postIdx: 0, requesterIdx: 2, status: 'pending' },
    { postIdx: 1, requesterIdx: 2, status: 'accepted' },
    { postIdx: 2, requesterIdx: 5, status: 'pending' },
    { postIdx: 4, requesterIdx: 7, status: 'accepted' },
  ];

  for (const m of matchRequestsData) {
    const post = createdCurrencyPosts[m.postIdx];
    const requester = createdUsers[m.requesterIdx];
    await prisma.currencyMatchRequest.create({
      data: {
        currencyPostId: post.id,
        requesterId: requester.id,
        targetUserId: post.userId,
        status: m.status as any,
      },
    });
  }

  const tripsData = [
    {
      userIdx: 8,
      fromCountry: 'Sri Lanka',
      toCountry: 'United Arab Emirates',
      departureDays: 10,
      arrivalDays: 12,
      maxWeightKg: 20,
      allowedCategories: 'Documents, Clothes',
      status: 'active',
    },
    {
      userIdx: 9,
      fromCountry: 'Sri Lanka',
      toCountry: 'Qatar',
      departureDays: 7,
      arrivalDays: 10,
      maxWeightKg: 15,
      allowedCategories: 'Documents, Electronics',
      status: 'active',
    },
    {
      userIdx: 0,
      fromCountry: 'India',
      toCountry: 'United Arab Emirates',
      departureDays: 5,
      arrivalDays: 7,
      maxWeightKg: 25,
      allowedCategories: 'Documents, Snacks',
      status: 'active',
    },
  ];

  const createdTrips = [];
  for (const t of tripsData) {
    const trip = await prisma.parcelTrip.create({
      data: {
        userId: createdUsers[t.userIdx].id,
        fromCountry: t.fromCountry,
        toCountry: t.toCountry,
        departureDate: new Date(
          now.getTime() + t.departureDays * 24 * 60 * 60 * 1000,
        ),
        arrivalDate: new Date(
          now.getTime() + t.arrivalDays * 24 * 60 * 60 * 1000,
        ),
        maxWeightKg: t.maxWeightKg,
        allowedCategories: t.allowedCategories,
        status: t.status as any,
      },
    });
    createdTrips.push(trip);
  }

  const requestsData = [
    {
      userIdx: 6,
      itemType: 'Documents',
      weightKg: 2,
      fromCountry: 'Bangladesh',
      toCountry: 'United Arab Emirates',
      fromDays: 3,
      toDays: 9,
      status: 'active',
    },
    {
      userIdx: 3,
      itemType: 'Clothes',
      weightKg: 5,
      fromCountry: 'Pakistan',
      toCountry: 'Qatar',
      fromDays: 4,
      toDays: 12,
      status: 'active',
    },
    {
      userIdx: 1,
      itemType: 'Electronics',
      weightKg: 3,
      fromCountry: 'India',
      toCountry: 'United Arab Emirates',
      fromDays: 2,
      toDays: 10,
      status: 'pending',
      tripIdx: 2,
      initiatedByIdx: 1,
    },
    {
      userIdx: 8,
      itemType: 'Snacks',
      weightKg: 4,
      fromCountry: 'Sri Lanka',
      toCountry: 'United Arab Emirates',
      fromDays: 5,
      toDays: 14,
      status: 'pending',
      tripIdx: 0,
      initiatedByIdx: 8,
    },
    {
      userIdx: 9,
      itemType: 'Books',
      weightKg: 6,
      fromCountry: 'Sri Lanka',
      toCountry: 'Qatar',
      fromDays: 6,
      toDays: 16,
      status: 'active',
    },
  ];

  for (const r of requestsData) {
    await prisma.parcelRequest.create({
      data: {
        userId: createdUsers[r.userIdx].id,
        tripId:
          typeof r.tripIdx === 'number' ? createdTrips[r.tripIdx].id : null,
        matchInitiatedByUserId:
          typeof r.initiatedByIdx === 'number'
            ? createdUsers[r.initiatedByIdx].id
            : null,
        itemType: r.itemType,
        weightKg: r.weightKg,
        fromCountry: r.fromCountry,
        toCountry: r.toCountry,
        flexibleFromDate: new Date(
          now.getTime() + r.fromDays * 24 * 60 * 60 * 1000,
        ),
        flexibleToDate: new Date(
          now.getTime() + r.toDays * 24 * 60 * 60 * 1000,
        ),
        status: r.status as any,
      },
    });
  }

  await prisma.$disconnect();
  process.stdout.write('Seed complete\n');
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
