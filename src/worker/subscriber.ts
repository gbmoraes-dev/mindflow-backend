import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { redis } from 'bun'
import { eq } from 'drizzle-orm'
import { channels } from '@/broker/channels'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { JournalCreatedMessage } from '@/domain/contracts/messages/journal-created-message'

channels.journals.consume(
  'journals',
  async (message) => {
    if (!message) {
      return null
    }

    const payload = message.content.toString()

    const { journalId, userId, content } = JSON.parse(
      payload,
    ) as JournalCreatedMessage

    try {
      await db
        .update(schema.journals)
        .set({
          analysisStatus: 'processing',
        })
        .where(eq(schema.journals.id, journalId))

      const prompt = `
      Você é um analista de bem-estar e saúde mental. Sua tarefa é analisar a entrada de diário fornecida pelo usuário.

      Responda APENAS com um objeto JSON válido. Não inclua nenhuma outra palavra, saudação, explicação ou formatação (como \`\`\`json) antes ou depois do objeto JSON.

      O objeto JSON deve ter exatamente a seguinte estrutura:
      {
        "sentiment": "string",
        "topics": ["string"],
        "summary": "string",
        "suggestion": "string"
      }

      Instruções para os campos:
      1.  "sentiment": Classifique o sentimento geral da entrada. Deve ser um dos seguintes valores: "positivo", "negativo", "neutro" ou "misto".
      2.  "topics": Identifique os 2 ou 3 tópicos principais discutidos. Retorne um array de strings (ex: ["trabalho", "ansiedade", "família"]). Se nenhum tópico claro for encontrado, retorne um array vazio [].
      3.  "summary": Escreva um resumo muito curto (máximo de 1-2 frases) em português, capturando a essência da entrada.
      4.  "suggestion": Com base no sentimento e nos tópicos, forneça um conselho gentil e acionável. Se o sentimento for "positivo", reforce o comportamento. Se for "negativo" ou "misto", ofereça uma sugestão de bem-estar ou uma perspectiva reflexiva que faça sentido com o que o usuário disse. Lembre-se, isso não é conselho médico, mas sim um apoio empático.
      `

      const { text } = await generateText({
        model: openai('gpt-5'),
        system: prompt,
        prompt: content,
      })

      const aiAnalysis = JSON.parse(text)

      await db
        .update(schema.journals)
        .set({
          analysisStatus: 'completed',
          aiAnalysis,
        })
        .where(eq(schema.journals.id, journalId))

      const channel = `journal:${journalId}:completed`

      const notification = JSON.stringify({
        event: 'analysis_completed',
        userId: userId,
        data: { journalId, aiAnalysis },
      })

      await redis.publish(channel, notification)

      channels.journals.ack(message)
    } catch (_) {
      if (journalId) {
        await db
          .update(schema.journals)
          .set({ analysisStatus: 'failed' })
          .where(eq(schema.journals.id, journalId))
      }

      channels.journals.nack(message, false, false)
    }
  },
  {
    noAck: false,
  },
)

console.log('👂 Worker listening for messages...')
