import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

type InferenceRequest = {
  id_image_xray?: string
}

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
) {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: corsHeaders,
    },
  )
}

Deno.serve(async (req: Request) => {
  try {
    // ---------------------------------------------------------
    // 1. Handle CORS preflight
    // ---------------------------------------------------------
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        status: 200,
        headers: corsHeaders,
      })
    }

    // ---------------------------------------------------------
    // 2. Only POST is allowed
    // ---------------------------------------------------------
    if (req.method !== 'POST') {
      return jsonResponse(
        {
          success: false,
          error: 'Only POST requests are allowed.',
        },
        405,
      )
    }

    // ---------------------------------------------------------
    // 3. Read Authorization header
    // ---------------------------------------------------------
    const authorization =
      req.headers.get('Authorization')

    if (!authorization) {
      return jsonResponse(
        {
          success: false,
          error: 'Missing Authorization header.',
        },
        401,
      )
    }

    if (!authorization.startsWith('Bearer ')) {
      return jsonResponse(
        {
          success: false,
          error: 'Invalid Authorization header.',
        },
        401,
      )
    }

    const accessToken = authorization
      .replace('Bearer ', '')
      .trim()

    if (!accessToken) {
      return jsonResponse(
        {
          success: false,
          error: 'Missing access token.',
        },
        401,
      )
    }

    // ---------------------------------------------------------
    // 4. Supabase environment variables
    // ---------------------------------------------------------
    const supabaseUrl =
      Deno.env.get('SUPABASE_URL')

    const serviceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse(
        {
          success: false,
          error:
            'Supabase environment variables are missing.',
        },
        500,
      )
    }

    // ---------------------------------------------------------
    // 5. Create Supabase admin client
    // ---------------------------------------------------------
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    )

    // ---------------------------------------------------------
    // 6. Validate authenticated user
    // ---------------------------------------------------------
    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken,
      )

    if (userError || !userData.user) {
      return jsonResponse(
        {
          success: false,
          error:
            'Invalid or expired authentication token.',
        },
        401,
      )
    }

    const user = userData.user

    // ---------------------------------------------------------
    // 7. Read request body
    // ---------------------------------------------------------
    let body: InferenceRequest

    try {
      body = await req.json()
    } catch {
      return jsonResponse(
        {
          success: false,
          error: 'Invalid JSON request body.',
        },
        400,
      )
    }

    const idImageXray =
      body.id_image_xray

    if (!idImageXray) {
      return jsonResponse(
        {
          success: false,
          error:
            'id_image_xray is required.',
        },
        400,
      )
    }

    // ---------------------------------------------------------
    // 8. Read X-Ray metadata
    // ---------------------------------------------------------
    const {
      data: image,
      error: imageError,
    } =
      await supabaseAdmin
        .from('images_xray')
        .select(`
          id,
          by_uploaded,
          id_case,
          bucket_storage,
          path_storage,
          filename_original,
          type_mime,
          bytes_size_file,
          status_inference,
          at_created
        `)
        .eq('id', idImageXray)
        .single()

    if (imageError || !image) {
      return jsonResponse(
        {
          success: false,
          error: `X-Ray image not found: ${
            imageError?.message ||
            'Unknown error'
          }`,
        },
        404,
      )
    }

    // ---------------------------------------------------------
    // 9. Verify image ownership
    // ---------------------------------------------------------
    if (image.by_uploaded !== user.id) {
      return jsonResponse(
        {
          success: false,
          error:
            'You do not have permission to process this X-Ray.',
        },
        403,
      )
    }

    // ---------------------------------------------------------
    // 10. Verify inference status
    // ---------------------------------------------------------
    if (
      image.status_inference !==
      'queued'
    ) {
      return jsonResponse(
        {
          success: false,
          error: `This image cannot be processed because its current status is "${image.status_inference}".`,
        },
        409,
      )
    }

    // ---------------------------------------------------------
    // 11. Read case
    // ---------------------------------------------------------
    const {
      data: caseData,
      error: caseError,
    } =
      await supabaseAdmin
        .from('cases')
        .select(`
          id,
          id_patient,
          id_clinic,
          by_created,
          part_body,
          priority,
          status,
          summary,
          at_created
        `)
        .eq('id', image.id_case)
        .single()

    if (caseError || !caseData) {
      return jsonResponse(
        {
          success: false,
          error: `Case not found: ${
            caseError?.message ||
            'Unknown error'
          }`,
        },
        404,
      )
    }

    // ---------------------------------------------------------
    // 12. Read user profile
    // ---------------------------------------------------------
    // IMPORTANT:
    // The actual profiles table uses active_is,
    // not is_active.
    // ---------------------------------------------------------
    const {
      data: profile,
      error: profileError,
    } =
      await supabaseAdmin
        .from('profiles')
        .select(`
          id,
          id_clinic,
          active_is,
          role,
          specialty
        `)
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
      return jsonResponse(
        {
          success: false,
          error: `User profile not found: ${
            profileError?.message ||
            'Unknown error'
          }`,
        },
        403,
      )
    }

    // ---------------------------------------------------------
    // 13. Verify active profile
    // ---------------------------------------------------------
    if (profile.active_is === false) {
      return jsonResponse(
        {
          success: false,
          error:
            'Your profile is inactive.',
        },
        403,
      )
    }

    // ---------------------------------------------------------
    // 14. Verify clinic access
    // ---------------------------------------------------------
    if (
      profile.id_clinic &&
      caseData.id_clinic &&
      profile.id_clinic !==
        caseData.id_clinic
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            'You do not have access to this clinic case.',
        },
        403,
      )
    }

    // ---------------------------------------------------------
    // 15. Verify Storage file exists
    // ---------------------------------------------------------
    const bucketName =
      image.bucket_storage ||
      'images-xray'

    if (!image.path_storage) {
      return jsonResponse(
        {
          success: false,
          error:
            'X-Ray storage path is missing.',
        },
        422,
      )
    }

    const {
      data: fileData,
      error: downloadError,
    } =
      await supabaseAdmin.storage
        .from(bucketName)
        .download(
          image.path_storage,
        )

    if (
      downloadError ||
      !fileData
    ) {
      return jsonResponse(
        {
          success: false,
          error: `Could not download X-Ray from Storage: ${
            downloadError?.message ||
            'Unknown error'
          }`,
        },
        422,
      )
    }

    // ---------------------------------------------------------
    // 16. Basic file validation
    // ---------------------------------------------------------
    const fileSize =
      fileData.size

    if (
      !fileSize ||
      fileSize <= 0
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            'The X-Ray file is empty.',
        },
        422,
      )
    }

    // Maximum 25 MB
    const maxFileSize =
      25 * 1024 * 1024

    if (
      fileSize >
      maxFileSize
    ) {
      return jsonResponse(
        {
          success: false,
          error:
            'The X-Ray file is larger than the 25 MB limit.',
        },
        413,
      )
    }

    // ---------------------------------------------------------
    // 17. Current AI stage
    // ---------------------------------------------------------
    // YOLO / YOLO-OBB model execution is not enabled yet
    // because the model weights have not been connected.
    //
    // We intentionally DO NOT create fake predictions here.
    // The image remains queued until the real model is connected.
    // ---------------------------------------------------------

    return jsonResponse(
      {
        success: true,
        stage: 'validated',
        message:
          'X-Ray validation succeeded. The image is ready for YOLO-OBB inference.',

        user: {
          id: user.id,
          role: profile.role,
          specialty:
            profile.specialty,
          id_clinic:
            profile.id_clinic,
        },

        image: {
          id: image.id,
          id_case:
            image.id_case,
          filename_original:
            image.filename_original,
          type_mime:
            image.type_mime,
          bytes_size_file:
            image.bytes_size_file,
          storage_bucket:
            bucketName,
          storage_path:
            image.path_storage,
          status_inference:
            image.status_inference,
        },

        case: {
          id: caseData.id,
          id_patient:
            caseData.id_patient,
          id_clinic:
            caseData.id_clinic,
          part_body:
            caseData.part_body,
          priority:
            caseData.priority,
          status:
            caseData.status,
        },

        validation: {
          authenticated: true,
          ownership_verified: true,
          clinic_access_verified: true,
          storage_file_verified: true,
          file_size_verified: true,
        },

        next_stage:
          'YOLO-OBB inference',

        ai_status: {
          model_execution_enabled: false,
          reason:
            'YOLO-OBB model weights are not connected yet.',
          predictions_created:
            false,
        },
      },
      200,
    )
  } catch (error) {
    console.error(
      'inference-run error:',
      error,
    )

    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected server error.',
      },
      500,
    )
  }
})