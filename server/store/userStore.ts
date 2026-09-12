import bcrypt from 'bcryptjs';
import { UserAccount } from '../../shared/types';

class UserStore {
  private users: Map<string, UserAccount> = new Map();

  constructor() {
    this.seedUsers();
  }

  private seedUsers(): void {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);

    const sneha: UserAccount = {
      id: 'student-sneha',
      name: 'Sneha Sharma',
      email: 'sneha@studyforge.ai',
      passwordHash: hash,
      planId: 'plan-sneha-dsa',
      createdAt: new Date().toISOString(),
    };

    this.users.set(sneha.email.toLowerCase(), sneha);
  }

  public findByEmail(email: string): UserAccount | undefined {
    return this.users.get(email.toLowerCase().trim());
  }

  public findById(id: string): UserAccount | undefined {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return undefined;
  }

  public createUser(name: string, email: string, plainPassword: string): { user?: UserAccount; error?: string } {
    const cleanEmail = email.toLowerCase().trim();
    if (this.users.has(cleanEmail)) {
      return { error: 'An account with this email already exists.' };
    }

    if (plainPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plainPassword, salt);
    const id = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser: UserAccount = {
      id,
      name,
      email: cleanEmail,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };

    this.users.set(cleanEmail, newUser);
    return { user: newUser };
  }

  public verifyPassword(user: UserAccount, plainPassword: string): boolean {
    return bcrypt.compareSync(plainPassword, user.passwordHash);
  }

  public updateUserPlanId(userId: string, planId: string): void {
    const user = this.findById(userId);
    if (user) {
      user.planId = planId;
    }
  }
}

export const userStore = new UserStore();
