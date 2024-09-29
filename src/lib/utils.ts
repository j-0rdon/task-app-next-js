import { type ClassValue } from "clsx"
import clsx from "clsx"  // Change this line
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}