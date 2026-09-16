import prisma from '../../lib/prisma';

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
  public async updateProfile(userId: string, data: { isOnline?: boolean; bio?: string; photoUrl?: string }) {
    const updateData: any = {};
    if (typeof data.isOnline === 'boolean') {
      updateData.isOnline = data.isOnline;
      if (!data.isOnline) {
        updateData.lastSeen = new Date();
      }
    }
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl;

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: userSelectFields,
    });
  }
}
