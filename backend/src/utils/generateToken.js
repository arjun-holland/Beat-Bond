import jwt from 'jsonwebtoken';

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Long-lived access token
  });

  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d' // Long-lived refresh token
  });

  return { accessToken, refreshToken };
};

export default generateTokens;
