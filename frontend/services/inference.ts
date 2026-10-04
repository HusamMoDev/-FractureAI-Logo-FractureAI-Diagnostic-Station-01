import { supabase } from '../lib/supabase'

export type InferenceRunResult = {
  success: boolean
  stage?: string
  message?: string
  next_stage?: string
  ai_status?: string
  image?: {
    id: string
    id_case: string
    filename: string
    mime_type: string
    bytes_size: number
    status_inference: string
  }
  case?: {
    id: string
    id_patient: string
    id_clinic: string
    part_body: string
    status: string
    priority: string
  }
  error?: string
}

export async function runInference(
  idImageXray: string,
): Promise<InferenceRunResult> {
  if (!idImageXray) {
    throw new Error('id_image_xray is required.')
  }

  const {
    data: {
      session,
    },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (!session?.access_token) {
    throw new Error(
      'No active Supabase session. Please sign in again.',
    )
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    'inference-run',
    {
      body: {
        id_image_xray: idImageXray,
      },
    },
  )

  if (error) {
    console.error(
      'inference-run invocation failed:',
      error,
    )

    throw new Error(
      error.message ||
        'The inference service could not be reached.',
    )
  }

  const result =
    data as InferenceRunResult

  if (!result?.success) {
    throw new Error(
      result?.error ||
        'Inference validation failed.',
    )
  }

  return result
}