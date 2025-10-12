import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "../../../../database";
import User from "../../../../models/user.model";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          
          // Check if user already exists with this Google ID
          let existingUser = await User.findOne({ 
            $or: [
              { googleId: account.providerAccountId },
              { email: user.email }
            ]
          });

          if (existingUser) {
            // Update existing user with Google ID if they signed up with email first
            if (!existingUser.googleId && existingUser.email === user.email) {
              existingUser.googleId = account.providerAccountId;
              existingUser.authProvider = 'google';
              existingUser.avatar = user.image || existingUser.avatar;
              await existingUser.save();
            }
          } else {
            // Create new user from Google profile
            existingUser = new User({
              name: user.name,
              email: user.email,
              avatar: user.image,
              googleId: account.providerAccountId,
              authProvider: 'google',
              profileCompleted: false
            });
            await existingUser.save();
          }

          // Attach database user ID to the session user
          user.id = existingUser._id.toString();
          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Persist the user ID and auth provider in the token
      if (account?.provider === "google" && user) {
        await connectDB();
        const dbUser = await User.findOne({ 
          $or: [
            { googleId: account.providerAccountId },
            { email: user.email }
          ]
        });
        
        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.authProvider = dbUser.authProvider;
          token.profileCompleted = dbUser.profileCompleted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to session
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
        session.user.authProvider = token.authProvider as string;
        session.user.profileCompleted = token.profileCompleted as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
