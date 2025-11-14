// app/triage/assess/page.tsx
import { Suspense } from "react"
import AssessContent from "./AssessContent"

export default function AssessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AssessContent />
    </Suspense>
  )
}