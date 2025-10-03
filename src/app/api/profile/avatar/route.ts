import { NextRequest } from 'next/server';
import { updateAvatarController } from '@/controllers/profile.controller';

export async function POST(request: NextRequest) {
  return updateAvatarController(request);
}