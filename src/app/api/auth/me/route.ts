import { NextRequest } from 'next/server';
import { getCurrentUserController } from '@/controllers/auth.controller';

export async function GET(request: NextRequest) {
  return getCurrentUserController(request);
}