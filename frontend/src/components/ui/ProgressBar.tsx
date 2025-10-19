import { CheckCircle } from 'lucide-react'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: string[]
  className?: string
}

export default function ProgressBar({ currentStep, totalSteps, steps, className }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-hedera-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`text-xs mt-2 text-center ${
                isCurrent ? 'text-hedera-600 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`absolute h-0.5 w-full top-4 left-1/2 transform -translate-y-1/2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`} style={{ zIndex: -1 }} />
              )}
            </div>
          )
        })}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-hedera-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  )
}
