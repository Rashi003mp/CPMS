'use client'

import { useEffect, useState } from 'react'
import { X, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from './button'

interface ImageUploadProps {
  value?: File | string
  onChange: (file: File | null) => void
  onRemove?: () => void
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else if (typeof value === 'string') {
      setPreview(value)
    } else {
      setPreview(null)
    }
  }, [value])

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Max size: ${maxSize}MB`
    }
    return null
  }

  const handleFileChange = (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    onChange(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileChange(file)
  }

  const handleRemove = () => {
    onChange(null)
    setPreview(null)
    setError(null)
    if (onRemove) onRemove()
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileChange(file)
            }}
            className="hidden"
            id="image-upload-input"
          />
          <label
            htmlFor="image-upload-input"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-10 w-10 text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max size: {maxSize}MB • {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
              </p>
            </div>
          </label>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
