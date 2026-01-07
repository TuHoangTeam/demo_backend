import { Body, Controller, Get, Put, Post, Param, UseGuards, Req, UseInterceptors, UploadedFile, HttpException, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager, wrap } from '@mikro-orm/core';
import { diskStorage } from 'multer';
import { extname } from 'path';

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

  // 1. LẤY THÔNG TIN CỦA TÔI (PROFILE)
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getMe(@Req() req: any) {
    // req.user được gán từ JwtStrategy
    const userId = req.user.id;
    const user = await this.userRepo.findOne(userId);
    
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    
    return new UserResponseDto(user);
  }

  // 2. CẬP NHẬT HỒ SƠ
  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update my profile' })
  async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user.id;
    const user = await this.userRepo.findOne(userId);
    
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Cập nhật dữ liệu từ DTO vào Entity
    wrap(user).assign(dto);
    
    await this.em.flush();
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
      destination: './uploads/avatars', // Nhớ tạo thư mục này
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
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new HttpException('File not provided', HttpStatus.BAD_REQUEST);

    const userId = req.user.id;
    const user = await this.userRepo.findOne(userId);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Lưu URL vào DB
    // Lưu ý: Domain nên lấy từ biến môi trường
    const avatarUrl = `http://localhost:3000/uploads/avatars/${file.filename}`;
    user.avatar = avatarUrl;
    
    await this.em.flush();
    return { avatarUrl };
  }

  // 4. LẤY THÔNG TIN NGƯỜI DÙNG KHÁC (PUBLIC INFO)
  @Get(':id')
  @ApiOperation({ summary: 'Get public user info' })
  async getUserById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    // Ở đây vẫn dùng UserResponseDto nhưng trong thực tế 
    // bạn có thể muốn ẩn thêm email hoặc số điện thoại
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
      gPoints: user.gPoints ?? 0, // Thường không show điểm cho người ngoài, nhưng API Docs yêu cầu
    };
  }
}