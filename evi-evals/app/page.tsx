import EvaluationForm from '@/components/evaluation-form'
import Header from '@/components/header'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <EvaluationForm />
      </main>
    </div>
  )
}

