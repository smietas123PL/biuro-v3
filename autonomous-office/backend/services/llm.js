import { GoogleGenerativeAI } from '@google/generative-ai';

export async function callLLMWithTools(agent, task, tools) {
  const model = agent.model || 'gpt-3.5-turbo';
  let responseText = '';
  let cost = 0.01; 

  try {
    if (model.startsWith('gpt')) {
      responseText = await callOpenAI(agent, task, tools);
    } else if (model.startsWith('claude')) {
      responseText = await callAnthropic(agent, task, tools);
    } else if (model.startsWith('gemini')) {
      const { text, calcCost } = await callGemini(agent, task, tools);
      responseText = text;
      cost = calcCost;
    } else if (model.startsWith('demo-')) {
      responseText = getDemoResponse(agent, task, tools);
    } else {
      responseText = `[Custom Model] Simulated response for: ${task.description}`;
    }
  } catch (error) {
    console.error(`LLM call failed for agent ${agent.name}:`, error.message);
    responseText = `Error processing task: ${error.message}`;
  }

  return { text: responseText, cost };
}

function getDemoResponse(agent, task, tools) {
  const desc = task.description.toLowerCase();
  
  if (agent.name.includes('Researcher')) {
    if (desc.includes('packaging')) {
      return `[Demo] Analiza trendów eko-opakowań:\n1. Biodegradowalne polimery z kukurydzy.\n2. Opakowania grzybowe (mycelium).\n3. Wielorazowe systemy szklane.\n\n@ContentWriter prośba o przygotowanie draftu posta na bloga o tych technologiach.`;
    }
    return `[Demo Research] Zebrano dane na temat: ${task.description}. Wyniki są obiecujące. @Analyst prośba o analizę biznesową.`;
  }
  
  if (agent.name.includes('Writer') || agent.name.includes('Content')) {
    return `[Demo Content] Draft posta na bloga:\n\n"Przyszłość jest zielona - nowe technologie w pakowaniu".\nDzięki danym od @Researcher wiemy, że rynek czeka na innowacje. Nasza firma planuje wdrożenie biodegradowalnych folii.\n\nFEEDBACK - proszę o opinię czy styl jest odpowiedni.`;
  }

  if (agent.name.includes('Analyst') || agent.name.includes('Manager')) {
    return `[Demo Analysis] Raport końcowy zatwierdzony. Koszty wdrożenia szacowane na $50k. Zwrot z inwestycji po 12 miesiącach. Wszystkie systemy gotowe do startu.`;
  }

  return `[Demo Simulation] Przetworzono zadanie "${task.description}" przez agenta ${agent.name}. Wszystko gotowe!`;
}

async function callOpenAI(agent, task, tools) {
  const apiKey = agent.api_key || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OpenAI API Key');
  return `[OpenAI ${agent.model}] Analyzed and processed: ${task.description}. Used tools: none.`;
}

async function callAnthropic(agent, task, tools) {
  const apiKey = agent.api_key || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing Anthropic API Key');
  return `[Anthropic ${agent.model}] Handled task: ${task.description}.`;
}

async function callGemini(agent, task, tools) {
  const apiKey = agent.api_key || process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Missing Google API Key (GEMINI)');
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ 
    model: agent.model,
    systemInstruction: `Jesteś autonomicznym agentem w firmie. Twoja rola: ${agent.role || 'Asystent'}`
  });

  const prompt = `ZADANIE DO WYKONANIA:\n${task.description}\n\nDo dyspozycji masz wygenerowane narzędzia (jeśli to potrzebne, opisz z których byś skorzystał):\n${tools.map(t=>t.name).join(', ')}`;
  
  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  
  // Przeliczanie kosztów (bardzo uproszczone dla Gemini 1.5 - np. $0.001 per call)
  const calcCost = 0.001; 
  
  return { text: response.text(), calcCost };
}
