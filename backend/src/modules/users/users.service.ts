import prisma from '../../lib/prisma';
import { UpdateProfileDTO } from './users.schemas';

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  vetStatus: true,
  licenseNumber: true,
  bio: true,
  photoUrl: true,
  ratingAvg: true,
  ratingCount: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
  updatedAt: true,
};

export class UsersService {
  public async updateProfile(userId: string, data: UpdateProfileDTO) {
    const updateData: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      bio?: string | null;
      photoUrl?: string | null;
      isOnline?: boolean;
      lastSeen?: Date;
    } = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    if (typeof data.isOnline === 'boolean') {
      updateData.isOnline = data.isOnline;
      if (!data.isOnline) {
        updateData.lastSeen = new Date();
      }
    }

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: userSelectFields,
    });
  }
}
