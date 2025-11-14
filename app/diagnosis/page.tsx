// app/diagnosis/page.tsx
import { Suspense } from "react"
import DiagnosisContent from "./DiagnosisContent"

export default function DiagnosisPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiagnosisContent />
    </Suspense>
  )
}