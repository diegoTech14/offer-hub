import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RoleState {
  isFreelancer: boolean;
  isLoading: boolean;
  switchRole: (toFreelancer: boolean) => Promise<void>;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      isFreelancer: false,
      isLoading: false,
      
      switchRole: async (toFreelancer: boolean) => {
        set({ isLoading: true });
        
        try {
          // await fetch('/api/user/role', { method: 'PATCH', body: JSON.stringify({ is_freelancer: toFreelancer }) });
          
          await new Promise(resolve => setTimeout(resolve, 500));
          set({ isFreelancer: toFreelancer, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    { name: 'role-storage' }
  )
);