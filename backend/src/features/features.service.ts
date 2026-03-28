import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeaturesService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    const features = await this.prisma.featureIdea.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: 'asc' }],
      include: { _count: { select: { votes: true } } },
    });

    const featureIds = features.map((f) => f.id);
    const votes = await this.prisma.featureVote.findMany({
      where: { userId, featureId: { in: featureIds } },
      select: { featureId: true },
    });
    const votedSet = new Set(votes.map((v) => v.featureId));

    return features
      .map((f) => ({
        id: f.id,
        slug: f.slug,
        title: f.title,
        shortDescription: f.shortDescription,
        longDescription: f.longDescription,
        voteCount: f._count.votes,
        voted: votedSet.has(f.id),
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      }))
      .sort((a, b) => b.voteCount - a.voteCount);
  }

  async getBySlugForUser(userId: string, slug: string) {
    const feature = await this.prisma.featureIdea.findUnique({
      where: { slug },
      include: { _count: { select: { votes: true } } },
    });

    if (!feature || !feature.isActive) {
      throw new NotFoundException('Feature not found');
    }

    const vote = await this.prisma.featureVote.findUnique({
      where: {
        featureId_userId: {
          featureId: feature.id,
          userId,
        },
      },
    });

    return {
      id: feature.id,
      slug: feature.slug,
      title: feature.title,
      shortDescription: feature.shortDescription,
      longDescription: feature.longDescription,
      voteCount: feature._count.votes,
      voted: Boolean(vote),
      createdAt: feature.createdAt,
      updatedAt: feature.updatedAt,
    };
  }

  async toggleVote(userId: string, slug: string) {
    const feature = await this.prisma.featureIdea.findUnique({
      where: { slug },
      select: { id: true, isActive: true },
    });

    if (!feature || !feature.isActive) {
      throw new NotFoundException('Feature not found');
    }

    const existing = await this.prisma.featureVote.findUnique({
      where: {
        featureId_userId: {
          featureId: feature.id,
          userId,
        },
      },
    });

    if (existing) {
      await this.prisma.featureVote.delete({
        where: { id: existing.id },
      });
    } else {
      await this.prisma.featureVote.create({
        data: { featureId: feature.id, userId },
      });
    }

    const voteCount = await this.prisma.featureVote.count({
      where: { featureId: feature.id },
    });

    return {
      voted: !existing,
      voteCount,
    };
  }
}
