import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'

export function TestCard() {
  return (
    <div className="p-8 space-y-4">
      <h1>Teste de Surface-Title</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Header com surface-title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Este card deve ter o header com cor surface-title</p>
          <p>Timestamp: {Date.now()}</p>
        </CardContent>
      </Card>

      <Card tone="emphasized">
        <CardHeader>
          <CardTitle>Card Enfatizado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Este é um card enfatizado com surface-2</p>
          <p>Header deve usar surface-title</p>
        </CardContent>
      </Card>
    </div>
  )
}
