import { RotateCcw } from 'lucide-react'

export default function RotatorPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Rotator</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola rotator produk untuk OBS overlay</p>
      </div>

      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
          <RotateCcw size={24} className="text-purple-600" />
        </div>
        <p className="text-gray-700 font-medium">Fitur Rotator</p>
        <p className="text-gray-400 text-sm mt-1">Akan dibuat di Phase 3</p>
      </div>
    </div>
  )
}
