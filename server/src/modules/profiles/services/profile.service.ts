import { profileRepository } from '../repositories/profile.repository';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';

export class ProfileService {
  
  async getProfile(userId: string) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');
    }

    const completionPercentage = this.calculateCompletionPercentage(profile);

    return {
      ...profile,
      completionPercentage,
    };
  }

  async updateProfile(userId: string, data: any) {
    // Ensure profile exists
    await this.getProfile(userId);
    return profileRepository.updateProfile(userId, data);
  }

  async addEducation(userId: string, data: any) {
    const profile = await this.getProfile(userId);
    return profileRepository.addEducation(profile.id, data);
  }

  async updateCareerGoals(userId: string, goals: any[]) {
    const profile = await this.getProfile(userId);
    await profileRepository.replaceCareerGoals(profile.id, goals);
    return this.getProfile(userId);
  }

  async updateCareerInterests(userId: string, interests: any[]) {
    const profile = await this.getProfile(userId);
    await profileRepository.replaceCareerInterests(profile.id, interests);
    return this.getProfile(userId);
  }

  private calculateCompletionPercentage(profile: any): number {
    // A simple heuristic for profile completion
    const fieldsToTrack = [
      'college',
      'branch',
      'graduationYear',
      'currentYear',
      'location',
    ];
    
    let filled = 0;
    let total = fieldsToTrack.length + 3; // +3 for education, goals, interests relations

    fieldsToTrack.forEach(field => {
      if (profile[field] !== null && profile[field] !== undefined && profile[field] !== '') {
        filled++;
      }
    });

    if (profile.education && profile.education.length > 0) filled++;
    if (profile.careerGoals && profile.careerGoals.length > 0) filled++;
    if (profile.careerInterests && profile.careerInterests.length > 0) filled++;

    return Math.round((filled / total) * 100);
  }
}

export const profileService = new ProfileService();
