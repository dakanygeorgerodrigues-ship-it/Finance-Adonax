import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const FALLBACK_TIPS = [
    "Poupe primeiro, gaste o que sobrar. Criar o hábito de guardar pelo menos 10% dos ganhos mensais fortalece seu patrimônio.",
    "Antes de fazer uma compra por impulso, aguarde 24 horas. Esse tempo ajuda a separar desejos momentâneos de necessidades reais.",
    "Acompanhe de perto os pequenos gastos diários. Café, lanches e pequenas taxas acumulam um valor surpreendente no fim do mês.",
    "Mantenha sua reserva de emergência em um investimento seguro e de liquidez diária. A prioridade aqui é a segurança, não a rentabilidade.",
    "Defina limites claros para despesas com estilo de vida. Controlar o supérfluo é a forma mais rápida de atingir seus maiores sonhos.",
    "Planeje grandes aquisições com antecedência. Comprar à vista permite negociar descontos expressivos e evita parcelamentos infinitos.",
    "Revise suas assinaturas mensais e cancele os serviços que não usa regularmente. Direcione essa economia para suas metas financeiras.",
    "Invista em sua educação financeira continuamente. O melhor investimento que você pode fazer é no seu próprio conhecimento sobre dinheiro."
  ];

  // API routes FIRST
  app.post("/api/financial-tip", async (req, res) => {
    try {
      const { transactions, budgets, goals } = req.body;
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const prompt = `Você é um consultor financeiro inteligente.
Com base nos dados fornecidos do usuário, forneça UMA dica financeira curta, prática e encorajadora (máximo 30 palavras) para o dia de hoje.
Não use jargões difíceis. Seja direto.

Transações recentes: ${JSON.stringify(transactions ? transactions.slice(0, 5) : [])}
Orçamentos: ${JSON.stringify(budgets || [])}
Objetivos: ${JSON.stringify(goals || [])}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      res.json({ tip: response.text });
    } catch (error: any) {
      console.log("[Tip System] Utilizing dynamic local advice fallback.");
      const randomIndex = Math.floor(Math.random() * FALLBACK_TIPS.length);
      const fallbackTip = FALLBACK_TIPS[randomIndex];
      res.json({ tip: fallbackTip, fallback: true });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
