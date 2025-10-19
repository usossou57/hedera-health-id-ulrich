import React, { useRef } from 'react'
import { Upload, File, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from './Button'

interface FileUploadProps {
  label?: string
  error?: string
  accept?: string
  multiple?: boolean
  onFileSelect: (files: FileList | null) => void
  selectedFiles?: File[]
  onFileRemove?: (index: number) => void
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  accept,
  multiple = false,
  onFileSelect,
  selectedFiles = [],
  onFileRemove,
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    onFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-hedera-400 transition-colors cursor-pointer',
          error && 'border-red-300'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Cliquez pour sélectionner ou glissez-déposez vos fichiers
        </p>
        <Button variant="outline" size="sm" type="button">
          Choisir fichier
        </Button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              {onFileRemove && (
                <button
                  type="button"
                  onClick={() => onFileRemove(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FileUpload
