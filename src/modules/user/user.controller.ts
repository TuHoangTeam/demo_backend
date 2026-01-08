import { Body, Controller, Get, Put, Post, Param, UseGuards, Req, UseInterceptors, UploadedFile, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager, wrap } from '@mikro-orm/core';
import { diskStorage } from 'multer';
import { extname } from 'path';
// 1. Dùng import type để tránh lỗi metadata khi build
import type { Request } from 'express';

import { User } from '../../entities/user/User';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @InjectRepository(User) private readonly userRepo: EntityRepository<User>,
    private readonly em: EntityManager,
  ) {}

  // --- HELPER FUNCTION ---
  // Hàm này không phải Controller method nên dùng type Request bình thường
  private toFullUrl(req: Request, path?: string): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    
    const protocol = req.protocol;
    const host = req.get('host'); 
    return `${protocol}://${host}/${path}`;
  }
  // -----------------------

  // 1. LẤY THÔNG TIN CỦA TÔI (PROFILE)
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMe(@Req() req: any) { // <--- Đổi thành any để tránh lỗi Build
    const request = req as Request; // <--- Ép kiểu lại để dùng
    const userId = (request.user as any).id;
    
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    
    if (user.avatar) {
      user.avatar = this.toFullUrl(request, user.avatar);
    }

    return new UserResponseDto(user);
  }

  // 2. CẬP NHẬT HỒ SƠ
  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) { // <--- Đổi thành any
    const request = req as Request; // <--- Ép kiểu
    const userId = (request.user as any).id;
    
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    wrap(user).assign(dto);
    await this.em.flush();

    if (user.avatar) {
      user.avatar = this.toFullUrl(request, user.avatar);
    }

    return new UserResponseDto(user);
  }

  // 3. UPLOAD AVATAR
  @Post('me/avatar')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars', 
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new HttpException('Only image files are allowed!', HttpStatus.BAD_REQUEST), false);
      }
      callback(null, true);
    },
  }))
  @ApiOperation({ summary: 'Upload avatar' })
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) { // <--- Đổi thành any
    if (!file) throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);
    const request = req as Request; // <--- Ép kiểu

    const userId = (request.user as any).id;
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const relativePath = `uploads/avatars/${file.filename}`;
    
    user.avatar = relativePath;
    await this.em.flush();

    return { avatarUrl: this.toFullUrl(request, relativePath) };
  }

  // 4. LẤY THÔNG TIN NGƯỜI DÙNG KHÁC (PUBLIC)
  @Get(':id')
  @ApiOperation({ summary: 'Get public user info' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) { // <--- Đổi thành any
    const request = req as Request; // <--- Ép kiểu
    
    const user = await this.userRepo.findOne(id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    if (user.avatar) {
      user.avatar = this.toFullUrl(request, user.avatar);
    }

    return new UserResponseDto(user);
  }

  // 5. LẤY THỐNG KÊ (STATS)
  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getUserStats(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    return {
      totalItemsGiven: user.totalItemsGiven ?? 0,
      totalItemsReceived: user.totalItemsReceived ?? 0,
      totalCO2Saved: user.totalCO2Saved ?? 0,
      rating: user.rating ?? 0,
      totalRatings: user.totalRatings ?? 0,
      gPoints: user.gPoints ?? 0,
    };
  }
}