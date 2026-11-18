/**
 * Principal-scoped onboarding profile store.
 * Production durable SQL is not applied (023 held). Injected memory store is for
 * unit/staging rehearsal only — never claim multi-device persistence from memory.
 */
import {exportProfile,normalizeProfile,type Profile} from "./researcherProfile";

export type OnboardingProfileRecord={
  principalId:string;
  profile:Profile;
  updatedAt:string;
};

export type OnboardingProfileStore={
  get(principalId:string):Promise<OnboardingProfileRecord|null>;
  put(principalId:string,profile:Profile,now:()=>Date):Promise<OnboardingProfileRecord>;
  clear?(principalId:string):Promise<void>;
};

/** Ephemeral process memory — tests and explicit rehearsal only. */
export function createMemoryOnboardingProfileStore():OnboardingProfileStore&{size():number}{
  const rows=new Map<string,OnboardingProfileRecord>();
  return{
    async get(principalId){
      return rows.get(principalId)??null;
    },
    async put(principalId,profile,now){
      const record:OnboardingProfileRecord={
        principalId,
        profile:exportProfile(normalizeProfile(profile)),
        updatedAt:now().toISOString(),
      };
      rows.set(principalId,record);
      return record;
    },
    async clear(principalId){
      rows.delete(principalId);
    },
    size:()=>rows.size,
  };
}
