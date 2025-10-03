import { NextRequest } from 'next/server';
import { getProfileController, updateProfileController } from '@/controllers/profile.controller';

export async function GET(request: NextRequest) {
  return getProfileController(request);
}

export async function PUT(request: NextRequest) {
  return updateProfileController(request);
}