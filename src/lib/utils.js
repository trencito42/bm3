import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export const cn = (...a) => twMerge(clsx(a))
export const money = (n) => '$' + Number(n).toFixed(2)
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
