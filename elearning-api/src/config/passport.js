const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const OAuth2Strategy = require('passport-oauth2');
const { User, University } = require('../models');
const logger = require('../utils/logger');

module.exports = (passport) => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await User.findByPk(payload.id, {
            include: [{
              model: University,
              as: 'university',
              attributes: ['id', 'name', 'name_ar', 'code', 'domain', 'is_active']
            }],
            attributes: { exclude: ['password'] }
          });

          if (user && user.is_active) {
            return done(null, user);
          }
          return done(null, false);
        } catch (error) {
          logger.error('JWT Strategy error:', error);
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth2 Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use('google-oauth2',
      new OAuth2Strategy(
        {
          authorizationURL: 'https://accounts.google.com/oauth/authorize',
          tokenURL: 'https://oauth2.googleapis.com/token',
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/v1/auth/google/callback',
          scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Get user info from Google
            const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
            const googleUser = await response.json();

            // Find existing user
            let user = await User.findOne({
              where: {
                email: googleUser.email
              },
              include: [{
                model: University,
                as: 'university'
              }]
            });

            if (user) {
              // Update OAuth info if user exists
              await user.update({
                oauth_provider: 'google',
                oauth_id: googleUser.id,
                last_login: new Date()
              });
            } else {
              // Create new user (this would need university context)
              logger.info(`New Google OAuth user: ${googleUser.email}`);
              // In a real implementation, you'd need to handle university assignment
              return done(null, false, { message: 'User not found. Please register first.' });
            }

            return done(null, user);
          } catch (error) {
            logger.error('Google OAuth error:', error);
            return done(error, null);
          }
        }
      )
    );
  }

  // Microsoft OAuth2 Strategy
  if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
    passport.use('microsoft-oauth2',
      new OAuth2Strategy(
        {
          authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
          clientID: process.env.MICROSOFT_CLIENT_ID,
          clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          callbackURL: '/api/v1/auth/microsoft/callback',
          scope: ['openid', 'profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Get user info from Microsoft
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });
            const microsoftUser = await response.json();

            // Find existing user
            let user = await User.findOne({
              where: {
                email: microsoftUser.mail || microsoftUser.userPrincipalName
              },
              include: [{
                model: University,
                as: 'university'
              }]
            });

            if (user) {
              // Update OAuth info if user exists
              await user.update({
                oauth_provider: 'microsoft',
                oauth_id: microsoftUser.id,
                last_login: new Date()
              });
            } else {
              // Create new user (this would need university context)
              logger.info(`New Microsoft OAuth user: ${microsoftUser.mail || microsoftUser.userPrincipalName}`);
              return done(null, false, { message: 'User not found. Please register first.' });
            }

            return done(null, user);
          } catch (error) {
            logger.error('Microsoft OAuth error:', error);
            return done(error, null);
          }
        }
      )
    );
  }

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id, {
        include: [{
          model: University,
          as: 'university',
          attributes: ['id', 'name', 'name_ar', 'code', 'domain', 'is_active']
        }],
        attributes: { exclude: ['password'] }
      });
      done(null, user);
    } catch (error) {
      logger.error('Deserialize user error:', error);
      done(error, null);
    }
  });
};