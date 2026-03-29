import { z } from 'zod'

export const paymentSchema = z.object({
  sale_id:       z.string().uuid(),
  shop_id:       z.string().uuid(),
  paid_date:     z.coerce.date(),
  amount_paid:   z.coerce.number().min(1),
  repaid_date:   z.coerce.date().optional(),
  amount_repaid: z.coerce.number().min(0).optional(),
  note:          z.string().optional(),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>
