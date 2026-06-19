import { z } from "zod";

export const signUpSchema = z.object({
  full_name: z.string().min(2, "Please enter your name.").max(80),
  username: z
    .string()
    .min(3, "At least 3 characters.")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only."),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "At least 8 characters."),
  account_type: z.enum(["musician", "manager", "room_owner"]),
});

export const signInSchema = z.object({
  email: z.email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

export const emailSchema = z.object({
  email: z.email("Enter a valid email."),
});

export const passwordSchema = z.object({
  password: z.string().min(8, "At least 8 characters."),
});

export const profileSchema = z.object({
  full_name: z.string().min(2).max(80),
  headline: z.string().max(120).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  bio: z.string().max(1000).optional().or(z.literal("")),
  avatar_url: z.url().optional().or(z.literal("")),
});

export const musicianSchema = z.object({
  genres: z.array(z.string()).max(12),
  instruments: z.array(z.string()).max(12),
  experience_level: z.enum(["beginner", "intermediate", "professional"]),
  available_for: z.array(z.string()).max(8),
  hourly_rate: z.coerce.number().min(0).max(10_000_000).optional(),
  years_experience: z.coerce.number().min(0).max(80).optional(),
  open_to_work: z.boolean().default(true),
});

export const roomSchema = z.object({
  name: z.string().min(3, "Give your room a name.").max(80),
  description: z.string().max(2000).optional().or(z.literal("")),
  neighborhood: z.string().min(1, "Pick a neighborhood."),
  address: z.string().max(160).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  hourly_price: z.coerce.number().min(0).max(10_000_000),
  capacity: z.coerce.number().int().min(1).max(100),
  amenities: z.array(z.string()),
  photos: z.array(z.url()).max(10),
});

export const bookingSchema = z.object({
  room_id: z.uuid(),
  date: z.string().min(1, "Pick a date."),
  start: z.string().min(1, "Pick a start time."),
  hours: z.coerce.number().min(1).max(12),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const contractSchema = z.object({
  musician_id: z.uuid(),
  title: z.string().min(4, "Add a short title.").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  event_date: z.string().optional().or(z.literal("")),
  venue: z.string().max(120).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
  budget: z.coerce.number().min(0).max(100_000_000).optional(),
});

export const reviewSchema = z.object({
  room_id: z.uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(800).optional().or(z.literal("")),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type MusicianFormValues = z.infer<typeof musicianSchema>;
