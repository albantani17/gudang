export const ENV = () => {
  const JWT_sECRET = process.env.JWT_SECRET;
  if (!JWT_sECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return {
    JWT_sECRET,
  };
};
