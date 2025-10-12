import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/database';
import User from '@/models/user.model';
import { v2 as cloudinary } from 'cloudinary';
import { decode } from 'next-auth/jwt';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Get User Profile Controller
 */
export async function getProfileController(req: NextRequest) {
  try {
    let userId = null;

    // First, try to get NextAuth JWT token (for Google OAuth users)
    const nextAuthToken = req.cookies.get('next-auth.session-token')?.value || 
                         req.cookies.get('__Secure-next-auth.session-token')?.value;
    
    if (nextAuthToken) {
      try {
        const decoded = await decode({
          token: nextAuthToken,
          secret: process.env.NEXTAUTH_SECRET!,
        });
        
        console.log('NextAuth decoded token:', decoded); // Debug log
        
        // Check for userId in the token (set in JWT callback)
        if (decoded?.userId) {
          userId = decoded.userId as string;
        }
        // Also check sub field (standard JWT field for user ID)
        else if (decoded?.sub) {
          userId = decoded.sub as string;
        }
        // Check email and find user by email as fallback
        else if (decoded?.email) {
          await connectDB();
          const user = await User.findOne({ email: decoded.email });
          if (user) {
            userId = user._id.toString();
          }
        }
      } catch (nextAuthError) {
        console.error('NextAuth token verification error:', nextAuthError);
      }
    }
    
    // Fall back to JWT token authentication (for local auth users)
    if (!userId) {
      const token = req.cookies.get('auth-token')?.value;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.userId;
        } catch (jwtError) {
          console.error('JWT verification error:', jwtError);
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to database (if not already connected)
    await connectDB();

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      authProvider: user.authProvider,
      healthProfile: user.healthProfile || {},
      profileCompleted: user.profileCompleted || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      user: userProfile
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * Update User Profile Controller
 */
export async function updateProfileController(req: NextRequest) {
  try {
    let userId = null;

    // First, try to get NextAuth JWT token (for Google OAuth users)
    const nextAuthToken = req.cookies.get('next-auth.session-token')?.value || 
                         req.cookies.get('__Secure-next-auth.session-token')?.value;
    
    if (nextAuthToken) {
      try {
        const decoded = await decode({
          token: nextAuthToken,
          secret: process.env.NEXTAUTH_SECRET!,
        });
        
        // Check for userId in the token (set in JWT callback)
        if (decoded?.userId) {
          userId = decoded.userId as string;
        }
        // Also check sub field (standard JWT field for user ID)
        else if (decoded?.sub) {
          userId = decoded.sub as string;
        }
        // Check email and find user by email as fallback
        else if (decoded?.email) {
          await connectDB();
          const user = await User.findOne({ email: decoded.email });
          if (user) {
            userId = user._id.toString();
          }
        }
      } catch (nextAuthError) {
        console.error('NextAuth token verification error:', nextAuthError);
      }
    }
    
    // Fall back to JWT token authentication (for local auth users)
    if (!userId) {
      const token = req.cookies.get('auth-token')?.value;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.userId;
        } catch (jwtError) {
          console.error('JWT verification error:', jwtError);
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const { name, healthProfile } = await req.json();

    // Connect to database
    await connectDB();

    // Update user
    const updateData: any = {};
    
    if (name) updateData.name = name.trim();
    if (healthProfile) updateData.healthProfile = healthProfile;
    
    // Check if profile is being completed
    if (healthProfile) {
      const requiredFields = ['height', 'weight', 'age', 'gender', 'activityLevel'];
      const hasRequiredFields = requiredFields.every(field => healthProfile[field]);
      if (hasRequiredFields) {
        updateData.profileCompleted = true;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return updated profile
    const userProfile = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      authProvider: updatedUser.authProvider,
      healthProfile: updatedUser.healthProfile || {},
      profileCompleted: updatedUser.profileCompleted || false,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: userProfile
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validationErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * Update Avatar Controller
 */
export async function updateAvatarController(req: NextRequest) {
  try {
    let userId = null;

    // First, try to get NextAuth JWT token (for Google OAuth users)
    const nextAuthToken = req.cookies.get('next-auth.session-token')?.value || 
                         req.cookies.get('__Secure-next-auth.session-token')?.value;
    
    if (nextAuthToken) {
      try {
        const decoded = await decode({
          token: nextAuthToken,
          secret: process.env.NEXTAUTH_SECRET!,
        });
        
        // Check for userId in the token (set in JWT callback)
        if (decoded?.userId) {
          userId = decoded.userId as string;
        }
        // Also check sub field (standard JWT field for user ID)
        else if (decoded?.sub) {
          userId = decoded.sub as string;
        }
        // Check email and find user by email as fallback
        else if (decoded?.email) {
          await connectDB();
          const user = await User.findOne({ email: decoded.email });
          if (user) {
            userId = user._id.toString();
          }
        }
      } catch (nextAuthError) {
        console.error('NextAuth token verification error:', nextAuthError);
      }
    }
    
    // Fall back to JWT token authentication (for local auth users)
    if (!userId) {
      const token = req.cookies.get('auth-token')?.value;
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.userId;
        } catch (jwtError) {
          console.error('JWT verification error:', jwtError);
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'fimyra/avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { format: 'webp' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const uploadedImage = uploadResult as any;

    // Connect to database
    await connectDB();

    // Update user avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadedImage.secure_url },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: uploadedImage.secure_url
    });

  } catch (error: any) {
    console.error('Update avatar error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update avatar' },
      { status: 500 }
    );
  }
}