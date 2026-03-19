import { z } from 'zod'

export const customerSchema = z.object({
  name:          z.string().min(2, 'Name is required'),
  aadhaar:       z.string().length(12, 'Aadhaar must be 12 digits').optional().or(z.literal('')),
  mobile1:       z.string().length(10, 'Enter valid 10-digit mobile'),
  mobile2:       z.string().length(10).optional().or(z.literal('')),
  mobile2_label: z.string().optional(),
  mobile3:       z.string().length(10).optional().or(z.literal('')),
  mobile3_label: z.string().optional(),
  mobile4:       z.string().length(10).optional().or(z.literal('')),
  mobile4_label: z.string().optional(),
  risk_level:    z.enum(['DANGER','WARNING','NEUTRAL','RELIABLE','SAFE']).default('NEUTRAL'),
  photo_url:     z.string().optional(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>
