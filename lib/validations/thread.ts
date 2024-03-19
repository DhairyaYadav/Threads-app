import * as z from 'zod'

export const ThreadValidation = z.object({
    thread: z.string().min(3,{ message: 'Minimum 3 characters required'}).max(1000,{message:'Maximum 30 characters allowed'}),
    accountId: z.string(),
})

export const CommentValidation = z.object({
    thread: z.string().min(3,{ message: 'Minimum 3 characters required'}).max(300,{message:'Maximum 30 characters allowed'}),
})