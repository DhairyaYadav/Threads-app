import * as z from 'zod'

export const UserValidation = z.object({
    profile_photo: z.string().url().nonempty(),
    name: z.string().min(3,{ message: 'Minimum 3 characters required'}).max(30,{message:'Maximum 30 characters allowed'}),
    username: z.string().min(3,{ message: 'Minimum 3 characters required'}).max(30,{message:'Maximum 30 characters allowed'}),
    bio: z.string().min(0).max(1000),
})