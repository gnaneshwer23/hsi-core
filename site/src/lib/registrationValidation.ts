/** Public form rules only. Provider-side account and password policy still applies. */
export const REGISTRATION_PASSWORD_MIN=12;
export const REGISTRATION_PASSWORD_MAX=128;
export type RegistrationFields={name:string;email:string;password:string};
export type RegistrationErrors=Partial<Record<keyof RegistrationFields,string>>;
export function validateRegistration(fields:RegistrationFields):RegistrationErrors {
 const errors:RegistrationErrors={};const name=fields.name.trim(),email=fields.email.trim();
 if(!name)errors.name="Enter your name.";else if(name.length>120)errors.name="Use a name of 120 characters or fewer.";
 if(!email)errors.email="Enter your email address.";else if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))errors.email="Enter a valid email address.";
 if(!fields.password)errors.password="Enter a password of at least 12 characters.";
 else if(fields.password.length<REGISTRATION_PASSWORD_MIN)errors.password="Use at least 12 characters for your password.";
 else if(fields.password.length>REGISTRATION_PASSWORD_MAX)errors.password="Use a password of 128 characters or fewer.";
 return errors;
}
