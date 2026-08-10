import { prisma } from '@/config/database';

export class GithubRepository {
  
  async upsertProfile(profileId: string, data: any) {
    return prisma.githubProfile.upsert({
      where: { profileId },
      update: {
        username: data.username,
        followers: data.followers,
        following: data.following,
        publicRepos: data.publicRepos,
        avatarUrl: data.avatarUrl,
        lastSyncedAt: new Date(),
      },
      create: {
        profileId,
        username: data.username,
        followers: data.followers,
        following: data.following,
        publicRepos: data.publicRepos,
        avatarUrl: data.avatarUrl,
      },
    });
  }

  async upsertRepository(githubProfileId: string, repo: any) {
    return prisma.githubRepository.upsert({
      where: {
        githubProfileId_githubId: {
          githubProfileId,
          githubId: repo.githubId,
        },
      },
      update: {
        name: repo.name,
        description: repo.description,
        url: repo.url,
        primaryLanguage: repo.primaryLanguage,
        stars: repo.stars,
        forks: repo.forks,
      },
      create: {
        githubProfileId,
        githubId: repo.githubId,
        name: repo.name,
        description: repo.description,
        url: repo.url,
        primaryLanguage: repo.primaryLanguage,
        stars: repo.stars,
        forks: repo.forks,
      },
    });
  }

  async getProfileWithRepos(profileId: string) {
    return prisma.githubProfile.findUnique({
      where: { profileId },
      include: {
        repositories: {
          orderBy: { stars: 'desc' },
        },
      },
    });
  }

  async calculateTotalStars(githubProfileId: string) {
    const agg = await prisma.githubRepository.aggregate({
      where: { githubProfileId },
      _sum: { stars: true },
    });
    
    await prisma.githubProfile.update({
      where: { id: githubProfileId },
      data: { totalStars: agg._sum.stars || 0 },
    });
  }
}

export const githubRepo = new GithubRepository();
