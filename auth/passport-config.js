const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const jwt = require('jsonwebtoken');

// Configuration des stratégies OAuth
function configurePassport(pool) {
  
  // =============== GOOGLE OAUTH ===============
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/auth/google/callback`,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const photoUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
          
          // Chercher un utilisateur existant avec ce provider
          let result = await pool.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['google', profile.id]
          );
          
          let user;
          
          if (result.rows.length > 0) {
            // Utilisateur existant - mettre à jour les infos
            user = result.rows[0];
            await pool.query(
              'UPDATE users SET photo_url = $1, email = $2, email_verified = $3 WHERE id = $4',
              [photoUrl, email, true, user.id]
            );
          } else {
            // Nouvel utilisateur - créer le compte
            const username = profile.displayName || `google_${profile.id}`;
            result = await pool.query(
              `INSERT INTO users (username, provider, provider_id, email, email_verified, photo_url, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
               RETURNING *`,
              [username, 'google', profile.id, email, true, photoUrl]
            );
            user = result.rows[0];
          }
          
          // Sauvegarder les tokens OAuth
          if (accessToken || refreshToken) {
            await pool.query(
              `INSERT INTO oauth_sessions (user_id, access_token, refresh_token, expires_at) 
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
              [user.id, accessToken, refreshToken]
            );
          }
          
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    ));
  }

  // =============== GITHUB OAUTH ===============
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/auth/github/callback`,
        scope: ['user:email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const photoUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : profile.avatar_url;
          
          let result = await pool.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['github', profile.id]
          );
          
          let user;
          
          if (result.rows.length > 0) {
            user = result.rows[0];
            await pool.query(
              'UPDATE users SET photo_url = $1, email = $2 WHERE id = $3',
              [photoUrl, email, user.id]
            );
          } else {
            const username = profile.username || profile.displayName || `github_${profile.id}`;
            result = await pool.query(
              `INSERT INTO users (username, provider, provider_id, email, photo_url, created_at) 
               VALUES ($1, $2, $3, $4, $5, NOW()) 
               RETURNING *`,
              [username, 'github', profile.id, email, photoUrl]
            );
            user = result.rows[0];
          }
          
          if (accessToken || refreshToken) {
            await pool.query(
              `INSERT INTO oauth_sessions (user_id, access_token, refresh_token, expires_at) 
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
              [user.id, accessToken, refreshToken]
            );
          }
          
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    ));
  }

  // =============== FACEBOOK OAUTH ===============
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'photos', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          const photoUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
          
          let result = await pool.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['facebook', profile.id]
          );
          
          let user;
          
          if (result.rows.length > 0) {
            user = result.rows[0];
            await pool.query(
              'UPDATE users SET photo_url = $1, email = $2 WHERE id = $3',
              [photoUrl, email, user.id]
            );
          } else {
            const username = profile.displayName || `facebook_${profile.id}`;
            result = await pool.query(
              `INSERT INTO users (username, provider, provider_id, email, photo_url, created_at) 
               VALUES ($1, $2, $3, $4, $5, NOW()) 
               RETURNING *`,
              [username, 'facebook', profile.id, email, photoUrl]
            );
            user = result.rows[0];
          }
          
          if (accessToken || refreshToken) {
            await pool.query(
              `INSERT INTO oauth_sessions (user_id, access_token, refresh_token, expires_at) 
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
              [user.id, accessToken, refreshToken]
            );
          }
          
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    ));
  }

  // =============== DISCORD OAUTH ===============
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/auth/discord/callback`,
        scope: ['identify', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.email || null;
          const photoUrl = profile.avatar ? 
            `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null;
          
          let result = await pool.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['discord', profile.id]
          );
          
          let user;
          
          if (result.rows.length > 0) {
            user = result.rows[0];
            await pool.query(
              'UPDATE users SET photo_url = $1, email = $2, email_verified = $3 WHERE id = $4',
              [photoUrl, email, profile.verified, user.id]
            );
          } else {
            const username = profile.username || `discord_${profile.id}`;
            result = await pool.query(
              `INSERT INTO users (username, provider, provider_id, email, email_verified, photo_url, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
               RETURNING *`,
              [username, 'discord', profile.id, email, profile.verified, photoUrl]
            );
            user = result.rows[0];
          }
          
          if (accessToken || refreshToken) {
            await pool.query(
              `INSERT INTO oauth_sessions (user_id, access_token, refresh_token, expires_at) 
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
              [user.id, accessToken, refreshToken]
            );
          }
          
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    ));
  }

  // =============== APPLE OAUTH ===============
  if (process.env.APPLE_SERVICE_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
    passport.use(new AppleStrategy({
        clientID: process.env.APPLE_SERVICE_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH || './auth/AuthKey.p8',
        callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/auth/apple/callback`,
        scope: ['name', 'email']
      },
      async (accessToken, refreshToken, idToken, profile, done) => {
        try {
          const email = profile.email || null;
          
          let result = await pool.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['apple', profile.sub]
          );
          
          let user;
          
          if (result.rows.length > 0) {
            user = result.rows[0];
            if (email) {
              await pool.query(
                'UPDATE users SET email = $1, email_verified = $2 WHERE id = $3',
                [email, true, user.id]
              );
            }
          } else {
            const username = (profile.name ? 
              `${profile.name.firstName} ${profile.name.lastName}`.trim() : null) || 
              `apple_${profile.sub.substring(0, 8)}`;
            
            result = await pool.query(
              `INSERT INTO users (username, provider, provider_id, email, email_verified, created_at) 
               VALUES ($1, $2, $3, $4, $5, NOW()) 
               RETURNING *`,
              [username, 'apple', profile.sub, email, true]
            );
            user = result.rows[0];
          }
          
          if (accessToken || refreshToken) {
            await pool.query(
              `INSERT INTO oauth_sessions (user_id, access_token, refresh_token, expires_at) 
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')`,
              [user.id, accessToken, refreshToken]
            );
          }
          
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    ));
  }

  // Sérialisation pour les sessions (optionnel, pour les cookies de session)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, result.rows[0]);
    } catch (error) {
      done(error, null);
    }
  });
}

// Générer un JWT token pour l'authentification mobile
function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      provider: user.provider
    },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
}

// Middleware pour vérifier le JWT
function verifyJWT(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = { configurePassport, generateJWT, verifyJWT };
