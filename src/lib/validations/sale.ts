import { z } from 'zod'

export const saleSchema = z.object({
  customer_id:              z.string().uuid('Select a customer'),
  shop_id:                  z.string().uuid(),
  loan_issue_date:          z.coerce.date(),
  down_payment:             z.coerce.number().min(0),
  loan_amount:              z.coerce.number().min(1),
  tenure_months:            z.coerce.number()
                              .min(1, 'Minimum tenure is 1 month')
                              .max(24, 'Maximum tenure is 24 months')
                              .int('Tenure must be a whole number'),
  emi_amount:               z.coerce.number().min(1),
  device_name:              z.string().min(1, 'Device name is required'),
  imei:                     z.string().optional(),
  reference_number:         z.string().optional(),
  co_name:                  z.string().optional(),
  co_mobile:                z.string().length(10).optional().or(z.literal('')),
  is_second_party:          z.boolean().default(false),
  second_party_customer_id: z.string().uuid().optional(),
  notes:                    z.string().optional(),
})

export type SaleFormValues = z.infer<typeof saleSchema>
