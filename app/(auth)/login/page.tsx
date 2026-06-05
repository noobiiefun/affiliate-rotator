import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-gray-400 text-sm">
          Memuat...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
