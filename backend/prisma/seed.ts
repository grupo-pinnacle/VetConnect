import { PrismaClient, Role, VetStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash common password
  const defaultPasswordHash = await bcrypt.hash('Password123!', 12);

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@vetconnect.com' },
    update: {},
    create: {
      email: 'admin@vetconnect.com',
      password: defaultPasswordHash,
      firstName: 'Admin',
      lastName: 'System',
      role: Role.ADMIN,
      isOnline: true,
    },
  });
  console.log(`✅ Seeded Admin: ${admin.email}`);

  // 2. Approved Vet
  const approvedVet = await prisma.user.upsert({
    where: { email: 'vet.approved@vetconnect.com' },
    update: {},
    create: {
      email: 'vet.approved@vetconnect.com',
      password: defaultPasswordHash,
      firstName: 'Dr. Carlos',
      lastName: 'Mendoza',
      phone: '+541155550001',
      role: Role.VET,
      vetStatus: VetStatus.APPROVED,
      licenseNumber: 'MP-8921',
      bio: 'Especialista en medicina felina y canina con 10 años de experiencia.',
      ratingAvg: 4.9,
      ratingCount: 15,
      isOnline: true,
    },
  });
  console.log(`✅ Seeded Approved Vet: ${approvedVet.email}`);

  // 3. Pending Vet
  const pendingVet = await prisma.user.upsert({
    where: { email: 'vet.pending@vetconnect.com' },
    update: {},
    create: {
      email: 'vet.pending@vetconnect.com',
      password: defaultPasswordHash,
      firstName: 'Dra. Ana',
      lastName: 'Gomez',
      phone: '+541155550002',
      role: Role.VET,
      vetStatus: VetStatus.PENDING,
      licenseNumber: 'MP-9942',
      bio: 'Veterinaria recien egresada en proceso de validacion de matricula.',
      ratingAvg: 0.0,
      ratingCount: 0,
      isOnline: false,
    },
  });
  console.log(`✅ Seeded Pending Vet: ${pendingVet.email}`);

  // 4. Client 1 with Dog (Microchip ISO 15 digits)
  const client1 = await prisma.user.upsert({
    where: { email: 'client1@vetconnect.com' },
    update: {},
    create: {
      email: 'client1@vetconnect.com',
      password: defaultPasswordHash,
      firstName: 'Lucia',
      lastName: 'Fernandez',
      phone: '+541155550003',
      role: Role.CLIENT,
      isOnline: true,
    },
  });

  const dog = await prisma.pet.create({
    data: {
      ownerId: client1.id,
      name: 'Rex',
      species: 'Canine',
      breed: 'Golden Retriever',
      weightKg: 28.5,
      sex: 'Male',
      microchip: '123456789012345',
      allergies: 'Ninguna',
      chronicConditions: 'Displasia leve de cadera',
    },
  });
  console.log(`✅ Seeded Client 1 (${client1.email}) with Dog (${dog.name}, Microchip: ${dog.microchip})`);

  // 5. Client 2 with Cat (No microchip)
  const client2 = await prisma.user.upsert({
    where: { email: 'client2@vetconnect.com' },
    update: {},
    create: {
      email: 'client2@vetconnect.com',
      password: defaultPasswordHash,
      firstName: 'Martin',
      lastName: 'Rossi',
      phone: '+541155550004',
      role: Role.CLIENT,
      isOnline: false,
    },
  });

  const cat = await prisma.pet.create({
    data: {
      ownerId: client2.id,
      name: 'Mishi',
      species: 'Feline',
      breed: 'Siamese',
      weightKg: 4.2,
      sex: 'Female',
      microchip: null,
      allergies: 'Polen',
      chronicConditions: null,
    },
  });
  console.log(`✅ Seeded Client 2 (${client2.email}) with Cat (${cat.name}, Microchip: null)`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
