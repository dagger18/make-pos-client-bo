import MediaService from '@/services/MediaService'

export function useMediaUpload() {
  const uploading = ref(false)

  async function uploadFile(file, parentData = {}) {
    uploading.value = true
    try {
      const presign = await MediaService.presign({
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      })

      const [s3Result, backupResult] = await Promise.allSettled([
        fetch(presign.s3UploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        }),
        fetch(presign.backupUploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        }),
      ])

      const s3Success = s3Result.status === 'fulfilled' && s3Result.value.ok
      const backupSuccess = backupResult.status === 'fulfilled' && backupResult.value.ok

      if (!s3Success && !backupSuccess) {
        throw new Error('Upload failed: neither S3 nor backup accepted the file')
      }

      return await MediaService.confirm({
        confirmToken: presign.confirmToken,
        s3Success,
        backupSuccess,
        ...parentData,
      })
    } finally {
      uploading.value = false
    }
  }

  return { uploadFile, uploading }
}
