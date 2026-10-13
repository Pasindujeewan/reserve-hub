import "server-only";

import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import type { LoginInput, RegisterInput } from "@/lib/auth-schema";

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: { userId: true },
  });

  if (existingUser) {
    return { error: "EMAIL_EXISTS" as const };
  }

  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id,
  });

  try {
    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: "USER",
      },
      select: {
        userId: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return { user };
  } catch (error) {
    // Handles a concurrent registration for the same email.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "EMAIL_EXISTS" as const };
    }

    throw error;
  }
}

export async function authenticateUser(data: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      userId: true,
      fullName: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await argon2.verify(user.passwordHash, data.password);

  if (!isPasswordValid) {
    return null;
  }

  return {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };
}

export async function getPublicUser(userId: number) {
  return prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}
