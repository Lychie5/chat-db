import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as DiscordStrategy } from 'passport-discord';
import AppleStrategy from 'passport-apple';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuration multer pour l'upload de photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées!'));
    }
  }
});

// Configuration des stratégies OAuth
export function configurePassport(pool) {
  
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
          
          let result = await pool.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            ['google', profile.id]
          );
          
          let user;
          
          if (result.rows.length > 0) {
            user = result.rows[0];
            await pool.query(
              'UPDATE users SET photo_url = $1, email = $2, email_verified = $3 WHERE id = $4',
              [photoUrl, email, true, user.id]
            );
          } else {
            const username = profile.displayName || `google_${profile.id}`;
            result = await pool.query(
              `INSERT INTO users (username, provider, provider_id, email, email_verified, photo_url, created_at) 
               VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
               RETURNING *`,
              [username, 'google', profile.id, email, true, photoUrl]
            );
            user = result.rows[0];
          }
          
          if (accessToken || refreshToken) {
            await pool.query(
              `INSERT INTO oauth_sessions (user_id, access_token, refresh_token, expires_at) 
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')
               ON CONFLICT DO NOTHING`,
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
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')
               ON CONFLICT DO NOTHING`,
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
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')
               ON CONFLICT DO NOTHING`,
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
               VALUES ($1, $2, $3, NOW() + INTERVAL '1 hour')
               ON CONFLICT DO NOTHING`,
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

  // Sérialisation pour les sessions
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
export function generateJWT(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      provider: user.provider,
      photo_url: user.photo_url
    },
    process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
}

// Middleware pour vérifier le JWT
export function verifyJWT(req, res, next) {
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

// Configuration des routes OAuth
export function setupOAuthRoutes(app, pool) {
  
  // Google OAuth
  app.get('/auth/google', passport.authenticate('google'));
  
  app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      const token = generateJWT(req.user);
      // Rediriger vers l'app mobile avec le token
      res.redirect(`myapp://auth?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
  );

  // GitHub OAuth
  app.get('/auth/github', passport.authenticate('github'));
  
  app.get('/auth/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      const token = generateJWT(req.user);
      res.redirect(`myapp://auth?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
  );

  // Facebook OAuth
  app.get('/auth/facebook', passport.authenticate('facebook'));
  
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      const token = generateJWT(req.user);
      res.redirect(`myapp://auth?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
  );

  // Discord OAuth
  app.get('/auth/discord', passport.authenticate('discord'));
  
  app.get('/auth/discord/callback',
    passport.authenticate('discord', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      const token = generateJWT(req.user);
      res.redirect(`myapp://auth?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
    }
  );

  // Upload de photo de profil
  app.post('/api/profile/photo', verifyJWT, upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const photoUrl = `/uploads/profiles/${req.file.filename}`;
      
      await pool.query(
        'UPDATE users SET photo_url = $1 WHERE id = $2',
        [photoUrl, req.user.id]
      );

      res.json({ success: true, photoUrl });
    } catch (error) {
      console.error('Erreur upload photo:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  });

  // Mise à jour du pseudo
  app.post('/api/profile/username', verifyJWT, async (req, res) => {
    try {
      const { username } = req.body;
      
      if (!username || username.trim().length < 3) {
        return res.status(400).json({ error: 'Le pseudo doit contenir au moins 3 caractères' });
      }

      // Vérifier si le pseudo existe déjà
      const existing = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username.trim(), req.user.id]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Ce pseudo est déjà utilisé' });
      }

      await pool.query(
        'UPDATE users SET username = $1 WHERE id = $2',
        [username.trim(), req.user.id]
      );

      res.json({ success: true, username: username.trim() });
    } catch (error) {
      console.error('Erreur mise à jour pseudo:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
  });

  // Récupérer le profil complet
  app.get('/api/profile', verifyJWT, async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, username, email, photo_url, provider, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
}

export { upload };
