import { githubRepo } from '../repositories/github.repository';
import { skillsService } from '@/modules/skills/services/skills.service';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { prisma } from '@/config/database';
import { logger } from '@/config/logger';

export class GithubService {
  
  async syncAccount(userId: string, username: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    try {
      // 1. Fetch User Data
      const userRes = await fetch(`https://api.github.com/users/${username}`, {
        headers: { 'User-Agent': 'CareerOS-Backend' }
      });
      
      if (userRes.status === 404) {
        throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, `GitHub user ${username} not found`);
      }
      if (!userRes.ok) throw new Error('GitHub API Error');
      
      const userData = await userRes.json();

      const githubProfile = await githubRepo.upsertProfile(profile.id, {
        username: userData.login,
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos,
        avatarUrl: userData.avatar_url,
      });

      // 2. Fetch Repositories
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
        headers: { 'User-Agent': 'CareerOS-Backend' }
      });
      const reposData = await reposRes.json();

      if (Array.isArray(reposData)) {
        for (const repo of reposData) {
          if (!repo.fork) { // Ignore forks to evaluate actual skills
            await githubRepo.upsertRepository(githubProfile.id, {
              githubId: repo.id.toString(),
              name: repo.name,
              description: repo.description,
              url: repo.html_url,
              primaryLanguage: repo.language,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
            });
          }
        }
      }

      await githubRepo.calculateTotalStars(githubProfile.id);

      // 3. Auto-Map Skills
      await this.analyzeAndMapSkills(userId, githubProfile.id);

      return githubRepo.getProfileWithRepos(profile.id);

    } catch (error) {
      logger.error({ err: error }, 'GitHub Sync Error');
      if (error instanceof AppError) throw error;
      throw new AppError(500, ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to sync with GitHub');
    }
  }

  async getDashboard(userId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const githubData = await githubRepo.getProfileWithRepos(profile.id);
    if (!githubData) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'GitHub account not synced');

    return githubData;
  }

  private async analyzeAndMapSkills(userId: string, githubProfileId: string) {
    // 1. Get all repos
    const githubData = await prisma.githubProfile.findUnique({
      where: { id: githubProfileId },
      include: { repositories: true },
    });

    if (!githubData) return;

    // 2. Count language frequencies
    const languageCounts: Record<string, { count: number, repos: string[] }> = {};
    
    for (const repo of githubData.repositories) {
      if (repo.primaryLanguage) {
        const lang = repo.primaryLanguage.toLowerCase();
        if (!languageCounts[lang]) languageCounts[lang] = { count: 0, repos: [] };
        languageCounts[lang].count++;
        languageCounts[lang].repos.push(repo.url);
      }
    }

    // 3. For each language found, try to map to a Master Skill
    const masterSkills = await prisma.skill.findMany();
    
    for (const [lang, data] of Object.entries(languageCounts)) {
      // Very basic heuristic match: check if a master skill name matches the language (e.g. "javascript")
      const matchedSkill = masterSkills.find(s => s.name.toLowerCase() === lang);
      
      if (matchedSkill) {
        // Base confidence logic: 1 level per repo, max 5, +1 for high frequency
        let calculatedLevel = Math.min(5, data.count); 
        if (data.count > 5) calculatedLevel += 1; // Slight bump for many repos

        await skillsService.evaluateSkill(userId, {
          skillId: matchedSkill.id,
          currentLevel: calculatedLevel,
          confidence: 8, // High confidence because we have GitHub proof
          evidence: data.repos[0], // Store primary repo as evidence
          source: 'GITHUB',
        });
        
        logger.info(`[GITHUB SYNC] Auto-mapped ${lang} to Skill ${matchedSkill.name} (Level ${calculatedLevel}) for User ${userId}`);
      }
    }
  }
}

export const githubService = new GithubService();
