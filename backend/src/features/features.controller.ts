import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeaturesService } from './features.service';

type AuthenticatedRequest = {
  user: {
    id: string;
    phoneNumber: string;
    isAdmin?: boolean;
  };
};

@UseGuards(AuthGuard('jwt'))
@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.featuresService.listForUser(req.user.id);
  }

  @Get(':slug')
  getOne(@Req() req: AuthenticatedRequest, @Param('slug') slug: string) {
    return this.featuresService.getBySlugForUser(req.user.id, slug);
  }

  @Post(':slug/vote')
  toggleVote(@Req() req: AuthenticatedRequest, @Param('slug') slug: string) {
    return this.featuresService.toggleVote(req.user.id, slug);
  }
}
